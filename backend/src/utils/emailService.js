const nodemailer = require('nodemailer');

// Tạo transporter từ biến môi trường
const createTransporter = () => {
  // Nếu chưa cấu hình SMTP → log warning và return null
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[EmailService] SMTP chưa được cấu hình. Email sẽ không được gửi.');
    console.warn('[EmailService] Vui lòng thiết lập SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS trong .env');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Gửi email nhắc đóng tiền
 * @param {Object} options
 * @param {string} options.to - Email người nhận
 * @param {string} options.tenantName - Tên người thuê
 * @param {string} options.roomNumber - Số phòng
 * @param {number} options.totalAmount - Tổng tiền
 * @param {string} options.invoiceNumber - Mã hóa đơn
 * @param {Date} options.dueDate - Ngày hết hạn
 * @param {number} options.daysLeft - Số ngày còn lại
 */
const sendPaymentReminder = async (options) => {
  const transporter = createTransporter();
  if (!transporter) return { success: false, reason: 'SMTP chưa cấu hình' };

  const { to, tenantName, roomNumber, totalAmount, invoiceNumber, dueDate, daysLeft } = options;

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(totalAmount);

  const formattedDate = new Date(dueDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const urgencyColor = daysLeft <= 1 ? '#e74c3c' : daysLeft <= 3 ? '#f39c12' : '#3498db';
  const urgencyText = daysLeft <= 1 ? '⚠️ RẤT GẤP' : daysLeft <= 3 ? '⏰ SẮP ĐẾN HẠN' : '📋 NHẮC NHỞ';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, ${urgencyColor}, ${urgencyColor}dd); color: white; padding: 24px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">${urgencyText} - Nhắc Đóng Tiền Phòng Trọ</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #333;">Xin chào <strong>${tenantName}</strong>,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          Hóa đơn tiền phòng của bạn sắp đến hạn thanh toán. Vui lòng thanh toán trước ngày hết hạn để tránh phát sinh phí trễ.
        </p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Mã hóa đơn:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Phòng:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${roomNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Tổng tiền:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: ${urgencyColor};">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Hạn thanh toán:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Còn lại:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${urgencyColor};">${daysLeft} ngày</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #999; text-align: center; margin-top: 24px;">
          Email này được gửi tự động từ hệ thống Quản Lý Nhà Trọ.<br/>
          Vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Quản Lý Nhà Trọ'}" <${process.env.SMTP_USER}>`,
      to,
      subject: `${urgencyText} Hóa đơn ${invoiceNumber} - Phòng ${roomNumber} - Còn ${daysLeft} ngày`,
      html: htmlContent,
    });

    console.log(`[EmailService] ✅ Đã gửi email nhắc tới ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] ❌ Lỗi gửi email tới ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email thông báo hóa đơn quá hạn
 */
const sendOverdueNotice = async (options) => {
  const transporter = createTransporter();
  if (!transporter) return { success: false, reason: 'SMTP chưa cấu hình' };

  const { to, tenantName, roomNumber, totalAmount, invoiceNumber, dueDate, overdueDays } = options;

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(totalAmount);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 24px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">🚨 CẢNH BÁO - Hóa Đơn Quá Hạn</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 16px; color: #333;">Xin chào <strong>${tenantName}</strong>,</p>
        <p style="font-size: 15px; color: #e74c3c; line-height: 1.6; font-weight: bold;">
          Hóa đơn ${invoiceNumber} (Phòng ${roomNumber}) đã quá hạn ${overdueDays} ngày!
        </p>
        <p style="font-size: 15px; color: #555;">
          Số tiền cần thanh toán: <strong style="color: #e74c3c; font-size: 18px;">${formattedAmount}</strong>
        </p>
        <p style="font-size: 15px; color: #555;">
          Vui lòng liên hệ chủ trọ để thanh toán ngay.
        </p>
        <p style="font-size: 13px; color: #999; text-align: center; margin-top: 24px;">
          Email này được gửi tự động từ hệ thống Quản Lý Nhà Trọ.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Quản Lý Nhà Trọ'}" <${process.env.SMTP_USER}>`,
      to,
      subject: `🚨 HÓA ĐƠN QUÁ HẠN - ${invoiceNumber} - Phòng ${roomNumber}`,
      html: htmlContent,
    });

    console.log(`[EmailService] ✅ Đã gửi email quá hạn tới ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] ❌ Lỗi gửi email quá hạn tới ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Gửi email xác nhận thanh toán (Biên lai)
 */
const sendPaymentReceipt = async (options) => {
  const transporter = createTransporter();
  if (!transporter) return { success: false, reason: 'SMTP chưa cấu hình' };

  const { to, tenantName, roomNumber, totalAmount, invoiceNumber, paymentDate, paymentMethod } = options;

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(totalAmount);

  const formattedDate = new Date(paymentDate || Date.now()).toLocaleString('vi-VN');
  
  const methodText = paymentMethod === 'vietqr' ? 'Chuyển khoản (VietQR)' : 
                     paymentMethod === 'transfer' ? 'Chuyển khoản' :
                     paymentMethod === 'momo' ? 'Ví MoMo' : 'Tiền mặt';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Biên Lai Thanh Toán</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f6; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #171a1b; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-top: 40px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 35px 40px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .content { padding: 40px; }
        .greeting { font-size: 16px; color: #374151; margin-bottom: 24px; line-height: 1.6; }
        .receipt-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 25px; margin-bottom: 30px; }
        .receipt-table { width: 100%; border-collapse: collapse; }
        .receipt-table th, .receipt-table td { padding: 12px 0; border-bottom: 1px dashed #e5e7eb; font-size: 15px; }
        .receipt-table th { color: #6b7280; font-weight: normal; text-align: left; width: 40%; }
        .receipt-table td { color: #111827; font-weight: 500; text-align: right; }
        .receipt-table tr:last-child th, .receipt-table tr:last-child td { border-bottom: none; }
        .total-row { background-color: #ecfdf5; border-radius: 4px; }
        .total-row th, .total-row td { padding: 16px; border-bottom: none; }
        .total-row th { color: #065f46; font-weight: 600; font-size: 16px; }
        .total-row td { color: #059669; font-weight: 700; font-size: 20px; }
        .footer { padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6; }
        .footer p { margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.5; }
        .badge { display: inline-block; padding: 6px 12px; background-color: #def7ec; color: #03543f; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="main" width="100%">
          <tr>
            <td class="header">
              <h1>Biên Lai Thanh Toán</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <div style="text-align: center;">
                <span class="badge">✓ THÀNH CÔNG</span>
              </div>
              <div class="greeting">
                Xin chào <strong>${tenantName}</strong>,<br><br>
                Cảm ơn bạn đã thanh toán hóa đơn tiền phòng. Dưới đây là thông tin chi tiết biên lai xác nhận thanh toán của bạn:
              </div>
              
              <div class="receipt-box">
                <table class="receipt-table">
                  <tr>
                    <th>Mã hóa đơn</th>
                    <td>${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <th>Phòng</th>
                    <td>${roomNumber}</td>
                  </tr>
                  <tr>
                    <th>Hình thức</th>
                    <td>${methodText}</td>
                  </tr>
                  <tr>
                    <th>Thời gian</th>
                    <td>${formattedDate}</td>
                  </tr>
                  <tr class="total-row">
                    <th>Tổng đã thanh toán</th>
                    <td>${formattedAmount}</td>
                  </tr>
                </table>
              </div>

              <div class="greeting" style="margin-bottom: 0; text-align: center; font-size: 15px; color: #4b5563;">
                Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ trực tiếp với ban quản lý nhà trọ.
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>Email này được tạo tự động bởi hệ thống Quản Lý Nhà Trọ.</p>
              <p style="font-size: 12px; color: #9ca3af;">Vui lòng không trả lời email này.</p>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Quản Lý Nhà Trọ'}" <${process.env.SMTP_USER}>`,
      to,
      subject: `XÁC NHẬN THANH TOÁN - Hóa đơn ${invoiceNumber} - Phòng ${roomNumber}`,
      html: htmlContent,
    });

    console.log(`[EmailService] ✅ Đã gửi biên lai tới ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] ❌ Lỗi gửi biên lai tới ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPaymentReminder, sendOverdueNotice, sendPaymentReceipt };
