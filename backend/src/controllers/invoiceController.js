const Invoice = require('../models/Invoice');
const Contract = require('../models/Contract');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const Notification = require('../models/Notification');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { getIO } = require('../utils/socket');

const generateVietQR = (bankInfo, amount, description) => {
  const { bankId, accountNo, accountName } = bankInfo || {
    bankId: 'TPB',
    accountNo: '00000907532',
    accountName: 'TRAN TAN PHAT'
  };
  
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
};

const refreshOverdueInvoices = async () => {
  const now = new Date();
  await Invoice.updateMany(
    { status: 'pending', dueDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
};

// @desc    Lấy danh sách phòng và hợp đồng để chuẩn bị tính tiền
// @route   GET /api/invoices/prepare?month=X&year=Y
// @access  Private/Admin
exports.getRoomsForInvoicing = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!month || !year) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tháng và năm' });
    }

    // Lấy tất cả hợp đồng đang active (Double Filter for Managers)
    let contractQuery = { status: 'active', landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      contractQuery.branchId = { $in: req.user.assignedBranches };
    }

    const activeContracts = await Contract.find(contractQuery)
      .populate('room', 'roomNumber price')
      .populate('tenant', 'fullName phoneNumber');

    // Lấy tất cả hóa đơn trong tháng/năm này
    let invoiceQuery = { month, year, landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      invoiceQuery.branchId = { $in: req.user.assignedBranches };
    }

    const invoices = await Invoice.find(invoiceQuery);
    const settings = await SystemSetting.findOne({ landlordId: req.user.landlordId }) || {};

    // Trả về danh sách đã gộp
    const result = await Promise.all(activeContracts.map(async (contract) => {
      const invoice = invoices.find(inv => inv.contract.toString() === contract._id.toString());
      const lastInvoice = await Invoice.findOne({
        contract: contract._id,
        landlordId: req.user.landlordId,
        $or: [
          { year: Number(year), month: { $lt: Number(month) } },
          { year: { $lt: Number(year) } }
        ]
      }).sort({ year: -1, month: -1 });

      const elecPrice = settings.electricityPrice || contract.electricityPrice;
      const watPrice = settings.waterPrice || contract.waterPrice;
      const wifiPr = settings.internetPrice || contract.wifiPrice || 100000;
      const trashPr = settings.trashPrice || contract.trashPrice || 50000;
      const otherPr = settings.otherServicePrice || contract.otherServicePrice || 0;

      // Tìm các phí bảo trì chưa thu của khách thuê này
      const pendingMaintenanceRequests = await MaintenanceRequest.find({
        room: contract.room._id,
        tenant: contract.tenant._id,
        status: 'completed',
        paidBy: 'tenant',
        paymentStatus: 'pending'
      });
      const pendingMaintenanceFee = pendingMaintenanceRequests.reduce((sum, req) => sum + (req.cost || 0), 0);
      const pendingMaintenanceNote = pendingMaintenanceRequests.map(req => req.description).join(', ');

      return {
        contractId: contract._id,
        room: contract.room,
        tenant: contract.tenant,
        rentPrice: contract.rentPrice,
        electricityPrice: elecPrice,
        waterPrice: watPrice,
        waterType: contract.waterType,
        hasWifi: contract.hasWifi,
        wifiPrice: wifiPr,
        hasTrash: contract.hasTrash,
        trashPrice: trashPr,
        hasOtherService: contract.hasOtherService,
        otherServicePrice: otherPr,
        servicePrice: (contract.hasWifi ? wifiPr : 0) + 
                      (contract.hasTrash ? trashPr : 0) + 
                      (contract.hasOtherService ? otherPr : 0),
        suggestedReading: {
          elecPrevious: lastInvoice?.electricity?.current || 0,
          waterPrevious: lastInvoice?.water?.current || 0,
          waterUsage: contract.waterType === 'per_person' ? (lastInvoice?.water?.usage || 1) : 0,
          maintenanceFee: invoice ? invoice.maintenanceFee : pendingMaintenanceFee,
          maintenanceNote: invoice ? invoice.maintenanceNote : pendingMaintenanceNote
        },
        invoice: invoice || null // Nếu chưa có hóa đơn thì null
      };
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
};

// @desc    Tạo hoặc cập nhật hóa đơn (nhập chỉ số điện nước)
// @route   POST /api/invoices
// @access  Private/Admin
exports.createOrUpdateInvoice = async (req, res) => {
  try {
    const { 
      contractId, month, year, 
      elecPrevious, elecCurrent, 
      waterPrevious, waterCurrent, waterUsage,
      extraFee, extraNote,
      maintenanceFee, maintenanceNote
    } = req.body;

    let contractQuery = { _id: contractId, landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      contractQuery.branchId = { $in: req.user.assignedBranches };
    }

    const contract = await Contract.findOne(contractQuery).populate('room');
    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng hoặc bạn không có quyền thao tác' });
    }

    if (!month || !year) {
      return res.status(400).json({ message: 'Thiếu thông tin tháng/năm hóa đơn' });
    }

    const settings = await SystemSetting.findOne({ landlordId: req.user.landlordId }) || {};
    const elecPrice = settings.electricityPrice || contract.electricityPrice;
    const watPrice = settings.waterPrice || contract.waterPrice;
    const wifiPr = settings.internetPrice || contract.wifiPrice || 100000;
    const trashPr = settings.trashPrice || contract.trashPrice || 50000;
    const otherPr = settings.otherServicePrice || contract.otherServicePrice || 0;

    // Tính toán điện
    const elecUsage = elecCurrent - elecPrevious;
    if (elecUsage < 0) {
      return res.status(400).json({ message: 'Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ' });
    }
    const elecAmount = elecUsage * elecPrice;

    // Tính toán nước
    let wUsage = 0;
    let wAmount = 0;
    if (contract.waterType === 'per_m3') {
      wUsage = waterCurrent - waterPrevious;
      if (wUsage < 0) {
        return res.status(400).json({ message: 'Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ' });
      }
      wAmount = wUsage * watPrice;
    } else {
      wUsage = waterUsage || 0;
      wAmount = wUsage * watPrice;
    }

    const hasWifi = req.body.hasWifi !== undefined ? req.body.hasWifi : contract.hasWifi;
    const hasTrash = req.body.hasTrash !== undefined ? req.body.hasTrash : contract.hasTrash;
    const hasOtherService = req.body.hasOtherService !== undefined ? req.body.hasOtherService : contract.hasOtherService;

    const wifiFee = hasWifi ? wifiPr : 0;
    const trashFee = hasTrash ? trashPr : 0;
    const otherFee = hasOtherService ? otherPr : 0;
    const servicePrice = wifiFee + trashFee + otherFee;

    const totalAmount = contract.rentPrice + elecAmount + wAmount + servicePrice + (Number(extraFee) || 0) + (Number(maintenanceFee) || 0);

    // Ngày hết hạn: ngày 5 của tháng tiếp theo (hoặc tùy chỉnh)
    const dueDate = new Date(year, month, 5); 

    let invoice = await Invoice.findOne({ contract: contractId, month, year, landlordId: req.user.landlordId });

    if (invoice) {
      // Giải phóng các yêu cầu bảo trì đã liên kết trước đó về pending
      await MaintenanceRequest.updateMany(
        { invoiceId: invoice._id },
        { $set: { paymentStatus: 'pending', invoiceId: null } }
      );

      // Update
      invoice.electricity = { previous: elecPrevious, current: elecCurrent, usage: elecUsage, price: elecPrice, amount: elecAmount };
      invoice.water = { previous: waterPrevious || 0, current: waterCurrent || 0, usage: wUsage, price: watPrice, amount: wAmount };
      invoice.roomPrice = contract.rentPrice;
      invoice.servicePrice = servicePrice;
      invoice.extraFee = Number(extraFee) || 0;
      invoice.extraNote = extraNote || '';
      invoice.maintenanceFee = Number(maintenanceFee) || 0;
      invoice.maintenanceNote = maintenanceNote || '';
      invoice.totalAmount = totalAmount;
      invoice.dueDate = dueDate;
      await invoice.save();
    } else {
      // Create new
      invoice = await Invoice.create({
        room: contract.room._id,
        tenant: contract.tenant,
        contract: contract._id,
        landlordId: req.user.landlordId,
        branchId: contract.branchId, // Set branch from contract
        month,
        year,
        electricity: { previous: elecPrevious, current: elecCurrent, usage: elecUsage, price: elecPrice, amount: elecAmount },
        water: { previous: waterPrevious || 0, current: waterCurrent || 0, usage: wUsage, price: watPrice, amount: wAmount },
        roomPrice: contract.rentPrice,
        servicePrice,
        extraFee: Number(extraFee) || 0,
        extraNote: extraNote || '',
        maintenanceFee: Number(maintenanceFee) || 0,
        maintenanceNote: maintenanceNote || '',
        totalAmount,
        dueDate
      });
    }

    // Liên kết các MaintenanceRequest tương ứng với hóa đơn này
    if (Number(maintenanceFee) > 0) {
      await MaintenanceRequest.updateMany(
        {
          room: contract.room._id,
          tenant: contract.tenant,
          status: 'completed',
          paidBy: 'tenant',
          paymentStatus: 'pending'
        },
        { $set: { paymentStatus: 'invoiced', invoiceId: invoice._id } }
      );
    }

    // Push notification khi tạo hóa đơn mới
    if (!req.body._isUpdate) {
      try {
        const tenant = await User.findById(contract.tenant);
        const roomNumber = contract.room?.roomNumber || 'N/A';
        const tenantName = tenant?.fullName || 'Khách thuê';

        const notif = await Notification.create({
          userId: contract.tenant,
          landlordId: req.user.landlordId,
          type: 'invoice_created',
          title: `Hóa đơn mới - Phòng ${roomNumber}`,
          message: `Hóa đơn tháng ${month}/${year} đã được tạo. Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(totalAmount)}đ. Hạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}.`,
          relatedModel: 'Invoice',
          relatedId: invoice._id,
        });

        try {
          const io = getIO();
          io.to(`user_${contract.tenant}`).emit('notification', {
            _id: notif._id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            relatedModel: notif.relatedModel,
            relatedId: notif.relatedId,
            isRead: false,
            createdAt: notif.createdAt
          });
        } catch (socketErr) { /* Socket not ready */ }
      } catch (notifErr) {
        console.error('Error creating invoice notification:', notifErr.message);
      }
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lưu hóa đơn: ' + error.message });
  }
};

// @desc    Lấy danh sách tất cả hóa đơn
// @route   GET /api/invoices
// @access  Private/Admin
exports.getInvoices = async (req, res) => {
  try {
    await refreshOverdueInvoices();

    const { status } = req.query;
    let query = { landlordId: req.user.landlordId };
    
    if (req.query.month) query.month = Number(req.query.month);
    if (req.query.year) query.year = Number(req.query.year);
    if (status) query.status = status;
    
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const invoices = await Invoice.find(query)
      .populate('room', 'roomNumber')
      .populate('tenant', 'fullName phoneNumber')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });

    const settings = await SystemSetting.findOne({ landlordId: req.user.landlordId });
    const bankInfo = settings ? settings.bankInfo : null;

    const invoicesWithQR = invoices.map(inv => ({
      ...inv._doc,
      qrCode: generateVietQR(bankInfo, inv.totalAmount, `QLNT ${inv.invoiceNumber}`)
    }));

    res.status(200).json({ success: true, data: invoicesWithQR });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật trạng thái thanh toán
// @route   PUT /api/invoices/:id/status
// @access  Private/Admin
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const allowedStatuses = ['pending', 'paid', 'overdue'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái hóa đơn không hợp lệ' });
    }
    let query = { _id: req.params.id, landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const invoice = await Invoice.findOne(query)
      .populate('tenant', 'fullName email')
      .populate('room', 'roomNumber');

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn hoặc bạn không có quyền cập nhật' });
    }

    const wasPending = invoice.status !== 'paid';
    invoice.status = status;
    if (status === 'paid') {
      invoice.paidDate = new Date();
      invoice.paymentMethod = paymentMethod || 'cash';
    } else {
      invoice.paidDate = undefined;
      invoice.paymentMethod = undefined;
    }

    await invoice.save();
    
    // Nếu hóa đơn được chuyển sang trạng thái đã thanh toán, cập nhật các yêu cầu bảo trì liên quan
    if (status === 'paid') {
      await MaintenanceRequest.updateMany(
        { invoiceId: invoice._id },
        { $set: { paymentStatus: 'paid' } }
      );
    } else {
      await MaintenanceRequest.updateMany(
        { invoiceId: invoice._id },
        { $set: { paymentStatus: 'invoiced' } }
      );
    }
    
    // Gửi email biên lai nếu chuyển sang paid
    if (status === 'paid' && wasPending && invoice.tenant && invoice.tenant.email) {
      const { sendPaymentReceipt } = require('../utils/emailService');
      sendPaymentReceipt({
        to: invoice.tenant.email,
        tenantName: invoice.tenant.fullName,
        roomNumber: invoice.room ? invoice.room.roomNumber : 'Không xác định',
        totalAmount: invoice.totalAmount,
        invoiceNumber: invoice.invoiceNumber,
        paymentDate: invoice.paidDate,
        paymentMethod: invoice.paymentMethod
      });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy hóa đơn của người thuê đang đăng nhập
// @route   GET /api/invoices/my-invoices
// @access  Private/Tenant
exports.getMyInvoices = async (req, res) => {
  try {
    await refreshOverdueInvoices();

    const { month, year, status } = req.query;
    const query = { tenant: req.user._id };

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('room', 'roomNumber')
      .sort({ year: -1, month: -1 });

    if (invoices.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get landlordId from the first invoice to fetch settings
    const landlordId = invoices[0].landlordId;
    const settings = await SystemSetting.findOne({ landlordId });
    const bankInfo = settings ? settings.bankInfo : null;

    const invoicesWithQR = invoices.map(inv => ({
      ...inv._doc,
      qrCode: generateVietQR(bankInfo, inv.totalAmount, `QLNT ${inv.invoiceNumber}`)
    }));

    res.status(200).json({ success: true, data: invoicesWithQR });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
