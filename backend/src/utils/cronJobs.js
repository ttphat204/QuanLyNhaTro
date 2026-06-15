const cron = require('node-cron');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPaymentReminder, sendOverdueNotice } = require('./emailService');
const { getIO } = require('./socket');

/**
 * Tính số ngày giữa 2 date (bỏ qua giờ)
 */
const diffInDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
};

/**
 * Job 1: Nhắc đóng tiền trước 3-5 ngày
 * Chạy hàng ngày lúc 8:00 sáng
 */
const paymentReminderJob = async () => {
  console.log('[CRON] 🔔 Bắt đầu quét hóa đơn sắp đến hạn...');

  try {
    const now = new Date();
    const in5Days = new Date(now);
    in5Days.setDate(in5Days.getDate() + 5);

    // Tìm hóa đơn pending có dueDate trong 5 ngày tới
    const upcomingInvoices = await Invoice.find({
      status: 'pending',
      dueDate: {
        $gte: now,
        $lte: in5Days
      }
    })
      .populate('room', 'roomNumber')
      .populate('tenant', 'fullName email phoneNumber');

    console.log(`[CRON] Tìm thấy ${upcomingInvoices.length} hóa đơn sắp đến hạn.`);

    let io;
    try {
      io = getIO();
    } catch (e) {
      console.warn('[CRON] Socket.IO chưa khởi tạo, bỏ qua realtime notification.');
    }

    for (const invoice of upcomingInvoices) {
      const daysLeft = diffInDays(invoice.dueDate, now);

      // Chỉ nhắc vào ngày 5, 3, 1 trước hạn
      if (![5, 3, 1].includes(daysLeft)) continue;

      // Kiểm tra đã gửi notification cho ngày này chưa (tránh trùng)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const existingNotif = await Notification.findOne({
        userId: invoice.tenant._id,
        type: 'payment_reminder',
        relatedId: invoice._id,
        createdAt: { $gte: todayStart, $lte: todayEnd }
      });

      if (existingNotif) {
        console.log(`[CRON] Đã gửi nhắc cho ${invoice.tenant.fullName} hôm nay, bỏ qua.`);
        continue;
      }

      const roomNumber = invoice.room?.roomNumber || 'N/A';
      const tenantName = invoice.tenant?.fullName || 'Khách thuê';
      const tenantEmail = invoice.tenant?.email;

      const title = `Nhắc đóng tiền - Phòng ${roomNumber}`;
      const message = `Hóa đơn ${invoice.invoiceNumber} còn ${daysLeft} ngày nữa là đến hạn. Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)}đ. Hạn: ${new Date(invoice.dueDate).toLocaleDateString('vi-VN')}.`;

      // 1. Tạo in-app notification
      const notification = await Notification.create({
        userId: invoice.tenant._id,
        landlordId: invoice.landlordId,
        type: 'payment_reminder',
        title,
        message,
        relatedModel: 'Invoice',
        relatedId: invoice._id,
      });

      // 2. Push realtime qua Socket.IO
      if (io) {
        io.to(`user_${invoice.tenant._id}`).emit('notification', {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          relatedModel: notification.relatedModel,
          relatedId: notification.relatedId,
          isRead: false,
          createdAt: notification.createdAt
        });
      }

      // 3. Gửi email nếu tenant có email
      if (tenantEmail) {
        const emailResult = await sendPaymentReminder({
          to: tenantEmail,
          tenantName,
          roomNumber,
          totalAmount: invoice.totalAmount,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: invoice.dueDate,
          daysLeft
        });

        if (emailResult.success) {
          notification.emailSent = true;
          await notification.save();
        }
      }

      // 4. Gửi notification cho landlord
      const landlordNotif = await Notification.create({
        userId: invoice.landlordId,
        landlordId: invoice.landlordId,
        type: 'payment_reminder',
        title: `Nhắc thuê nhà - ${tenantName} (Phòng ${roomNumber})`,
        message: `Hóa đơn ${invoice.invoiceNumber} của ${tenantName} còn ${daysLeft} ngày đến hạn. Số tiền: ${new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)}đ.`,
        relatedModel: 'Invoice',
        relatedId: invoice._id,
      });

      if (io) {
        io.to(`user_${invoice.landlordId}`).emit('notification', {
          _id: landlordNotif._id,
          type: landlordNotif.type,
          title: landlordNotif.title,
          message: landlordNotif.message,
          isRead: false,
          createdAt: landlordNotif.createdAt
        });
      }

      console.log(`[CRON] ✅ Đã nhắc: ${tenantName} - Phòng ${roomNumber} - Còn ${daysLeft} ngày`);
    }

    console.log('[CRON] ✅ Hoàn thành quét hóa đơn sắp đến hạn.');
  } catch (error) {
    console.error('[CRON] ❌ Lỗi khi quét hóa đơn:', error.message);
  }
};

/**
 * Job 2: Quét hóa đơn quá hạn → đánh dấu overdue + gửi cảnh báo
 * Chạy hàng ngày lúc 9:00 sáng
 */
const overdueCheckJob = async () => {
  console.log('[CRON] 🔍 Bắt đầu quét hóa đơn quá hạn...');

  try {
    const now = new Date();

    // Cập nhật status từ pending → overdue
    const result = await Invoice.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    console.log(`[CRON] Đã đánh dấu ${result.modifiedCount} hóa đơn thành quá hạn.`);

    // Gửi thông báo cho hóa đơn quá hạn (chỉ gửi 1 lần/ngày)
    const overdueInvoices = await Invoice.find({ status: 'overdue' })
      .populate('room', 'roomNumber')
      .populate('tenant', 'fullName email');

    let io;
    try {
      io = getIO();
    } catch (e) { /* ignore */ }

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    for (const invoice of overdueInvoices) {
      const overdueDays = diffInDays(now, invoice.dueDate);

      // Chỉ nhắc vào ngày 1, 3, 7 sau quá hạn
      if (![1, 3, 7].includes(overdueDays)) continue;

      const existingNotif = await Notification.findOne({
        userId: invoice.tenant._id,
        type: 'invoice_overdue',
        relatedId: invoice._id,
        createdAt: { $gte: todayStart }
      });

      if (existingNotif) continue;

      const roomNumber = invoice.room?.roomNumber || 'N/A';
      const tenantName = invoice.tenant?.fullName || 'Khách thuê';

      const notification = await Notification.create({
        userId: invoice.tenant._id,
        landlordId: invoice.landlordId,
        type: 'invoice_overdue',
        title: `⚠️ Hóa đơn quá hạn - Phòng ${roomNumber}`,
        message: `Hóa đơn ${invoice.invoiceNumber} đã quá hạn ${overdueDays} ngày. Vui lòng thanh toán ngay.`,
        relatedModel: 'Invoice',
        relatedId: invoice._id,
      });

      if (io) {
        io.to(`user_${invoice.tenant._id}`).emit('notification', {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: false,
          createdAt: notification.createdAt
        });
      }

      // Gửi email overdue
      if (invoice.tenant?.email) {
        const emailResult = await sendOverdueNotice({
          to: invoice.tenant.email,
          tenantName,
          roomNumber,
          totalAmount: invoice.totalAmount,
          invoiceNumber: invoice.invoiceNumber,
          dueDate: invoice.dueDate,
          overdueDays
        });

        if (emailResult.success) {
          notification.emailSent = true;
          await notification.save();
        }
      }

      // Gửi cho landlord
      const landlordNotif = await Notification.create({
        userId: invoice.landlordId,
        landlordId: invoice.landlordId,
        type: 'invoice_overdue',
        title: `🚨 ${tenantName} quá hạn ${overdueDays} ngày (Phòng ${roomNumber})`,
        message: `Hóa đơn ${invoice.invoiceNumber} - ${new Intl.NumberFormat('vi-VN').format(invoice.totalAmount)}đ. Chưa thanh toán.`,
        relatedModel: 'Invoice',
        relatedId: invoice._id,
      });

      if (io) {
        io.to(`user_${invoice.landlordId}`).emit('notification', {
          _id: landlordNotif._id,
          type: landlordNotif.type,
          title: landlordNotif.title,
          message: landlordNotif.message,
          isRead: false,
          createdAt: landlordNotif.createdAt
        });
      }
    }

    console.log('[CRON] ✅ Hoàn thành quét hóa đơn quá hạn.');
  } catch (error) {
    console.error('[CRON] ❌ Lỗi khi quét hóa đơn quá hạn:', error.message);
  }
};

/**
 * Khởi động tất cả CRON Jobs
 */
const startCronJobs = () => {
  console.log('[CRON] 🚀 Khởi động CRON Jobs...');

  // Job 1: Nhắc đóng tiền - chạy hàng ngày lúc 8:00 sáng
  cron.schedule('0 8 * * *', paymentReminderJob, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
  console.log('[CRON] ✅ Payment Reminder Job đã lên lịch (8:00 AM hàng ngày)');

  // Job 2: Kiểm tra quá hạn - chạy hàng ngày lúc 9:00 sáng
  cron.schedule('0 9 * * *', overdueCheckJob, {
    timezone: 'Asia/Ho_Chi_Minh'
  });
  console.log('[CRON] ✅ Overdue Check Job đã lên lịch (9:00 AM hàng ngày)');
};

module.exports = { startCronJobs, paymentReminderJob, overdueCheckJob };
