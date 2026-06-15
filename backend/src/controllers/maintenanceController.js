const MaintenanceRequest = require('../models/MaintenanceRequest');
const Contract = require('../models/Contract');
const Expense = require('../models/Expense');
const Room = require('../models/Room');

// @desc    Tạo yêu cầu bảo trì mới (Tenant)
// @route   POST /api/maintenance
// @access  Private/Tenant
exports.createRequest = async (req, res) => {
  try {
    const { description, images, priority } = req.body;

    // Tìm hợp đồng hoạt động của khách thuê để xác định phòng, chi nhánh, chủ nhà
    const contract = await Contract.findOne({
      tenant: req.user._id,
      status: 'active'
    });

    if (!contract) {
      return res.status(400).json({
        success: false,
        message: 'Bạn hiện không có hợp đồng hoạt động nào trong hệ thống.'
      });
    }

    const newRequest = await MaintenanceRequest.create({
      landlordId: contract.landlordId,
      branchId: contract.branchId,
      room: contract.room,
      tenant: req.user._id,
      description,
      images: images || [],
      priority: priority || 'medium',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy danh sách yêu cầu của Tenant hiện tại
// @route   GET /api/maintenance/my
// @access  Private/Tenant
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ tenant: req.user._id })
      .populate('room', 'roomNumber')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả yêu cầu bảo trì (Landlord / Manager)
// @route   GET /api/maintenance
// @access  Private/Landlord/Manager
exports.getAllRequests = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId || req.user._id };

    // Nếu là Manager, lọc theo các chi nhánh được phân công
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    // Lọc theo chi nhánh từ query params nếu có
    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    // Lọc theo trạng thái từ query params nếu có
    if (req.query.status) {
      query.status = req.query.status;
    }

    const requests = await MaintenanceRequest.find(query)
      .populate('room', 'roomNumber')
      .populate('branchId', 'name')
      .populate('tenant', 'fullName phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật trạng thái / phân công / chi phí yêu cầu bảo trì (Landlord / Manager)
// @route   PATCH /api/maintenance/:id
// @access  Private/Landlord/Manager
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, assignedTo, cost, notes, paidBy } = req.body;

    let request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu bảo trì.'
      });
    }

    // Đảm bảo Manager chỉ có thể sửa đổi nếu thuộc chi nhánh quản lý
    if (req.user.role === 'manager' && !req.user.assignedBranches.some(b => b.toString() === request.branchId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền quản lý sự cố tại chi nhánh này.'
      });
    }

    // Cập nhật thông tin
    if (status) request.status = status;
    if (assignedTo !== undefined) request.assignedTo = assignedTo;
    if (cost !== undefined) request.cost = Number(cost);
    if (notes !== undefined) request.notes = notes;
    if (paidBy !== undefined) request.paidBy = paidBy;

    // Nếu chuyển sang trạng thái completed và có chi phí
    if (request.status === 'completed' && request.cost > 0) {
      if (request.paidBy === 'landlord') {
        request.paymentStatus = 'paid';
      } else {
        request.paymentStatus = 'pending';
      }
    }

    await request.save();

    // Nếu chuyển sang trạng thái completed và có chi phí, tự động tạo/cập nhật Expense hoặc xóa nếu khách chịu
    if (request.status === 'completed' && request.cost > 0) {
      if (request.paidBy === 'landlord') {
        const room = await Room.findById(request.room);
        const roomNum = room ? `phòng ${room.roomNumber}` : 'phòng trọ';

        await Expense.findOneAndUpdate(
          { maintenanceRequestId: request._id },
          {
            landlordId: request.landlordId,
            branchId: request.branchId,
            title: `Bảo trì: Sửa chữa ${roomNum} (${request.description.slice(0, 30)}...)`,
            amount: request.cost,
            category: 'maintenance',
            date: new Date(),
            note: `Tự động tạo từ yêu cầu bảo trì hoàn thành. ${request.notes || ''}`
          },
          { upsert: true, new: true }
        );
      } else {
        // Khách trả: Xóa Expense liên kết nếu có
        await Expense.deleteOne({ maintenanceRequestId: request._id });
      }
    }

    // Lấy bản ghi đầy đủ để trả về
    const updatedRequest = await MaintenanceRequest.findById(request._id)
      .populate('room', 'roomNumber')
      .populate('branchId', 'name')
      .populate('tenant', 'fullName phoneNumber');

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
