const Room = require('../models/Room');
const Contract = require('../models/Contract');

// @desc    Get tenant's own room (via active contract)
// @route   GET /api/rooms/my-room
// @access  Private (Tenant)
exports.getMyRoom = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      tenant: req.user._id,
      status: 'active'
    }).populate('room');

    if (!contract || !contract.room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng được gán cho bạn'
      });
    }

    const room = await Room.findById(contract.room._id)
      .populate('currentTenant', 'fullName email')
      .populate('branchId', 'name');

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private (Admin)
exports.getRooms = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId };

    // Double Filter for Managers
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const rooms = await Room.find(query)
      .populate('currentTenant', 'fullName email')
      .populate('branchId', 'name electricityPrice waterPrice internetPrice garbagePrice priceTiers');

    // Add price fallback for frontend if missing
    const roomsWithFallback = rooms.map(room => {
      const roomObj = room.toObject();
      return roomObj;
    });

    res.status(200).json({
      success: true,
      count: roomsWithFallback.length,
      data: roomsWithFallback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private (Admin)
exports.getRoom = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId };
    
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const room = await Room.findOne(query)
      .populate('currentTenant', 'fullName email')
      .populate('branchId', 'name electricityPrice waterPrice internetPrice garbagePrice priceTiers');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng hoặc bạn không có quyền truy cập' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin)
exports.createRoom = async (req, res) => {
  try {
    req.body.landlordId = req.user.landlordId;

    // Phân quyền cho Manager khi tạo phòng
    if (req.user.role === 'manager') {
      const isAssigned = req.user.assignedBranches.some(
        id => id.toString() === req.body.branchId
      );
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo phòng ở chi nhánh này' });
      }

      // Ép buộc giá phòng lấy từ Chi nhánh do Landlord thiết lập
      const Branch = require('../models/Branch');
      const branch = await Branch.findOne({ _id: req.body.branchId, landlordId: req.user.landlordId });
      if (!branch) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh tương ứng' });
      }

      if (req.body.priceTierId) {
        const tier = branch.priceTiers.id(req.body.priceTierId);
        if (tier) {
          req.body.price = tier.price;
        } else {
          return res.status(400).json({ success: false, message: 'Mức giá phòng (Price Tier) không hợp lệ' });
        }
      } else {
        req.body.price = 0;
        req.body.priceTierId = null;
      }
    } else {
      // Logic cũ của Landlord
      if (req.body.priceTierId) {
        const Branch = require('../models/Branch');
        const branch = await Branch.findOne({ _id: req.body.branchId, landlordId: req.user.landlordId });
        if (branch && branch.priceTiers) {
          const tier = branch.priceTiers.id(req.body.priceTierId);
          if (tier) {
            req.body.price = tier.price;
          }
        }
      } else if (!req.body.price) {
        req.body.price = 0;
      }
    }

    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Số phòng đã tồn tại' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
exports.updateRoom = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId };
    
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    let updateData;
    if (req.user.role === 'manager') {
      updateData = { ...req.body };
      // Khóa cứng giá và thông tin nhạy cảm đối với Manager
      delete updateData.price;
      delete updateData.priceTierId;
      delete updateData.landlordId;
      delete updateData.branchId;
      delete updateData.currentTenant;
    } else {
      updateData = { ...req.body };
    }

    // Nếu không phải Manager, xử lý cập nhật Price Tier của Landlord
    if (req.user.role !== 'manager') {
      if (req.body.priceTierId) {
        const Branch = require('../models/Branch');
        let branchId = req.body.branchId;
        if (!branchId) {
          const existingRoom = await Room.findOne(query);
          if (existingRoom) {
            branchId = existingRoom.branchId;
          }
        }
        if (branchId) {
          const branch = await Branch.findOne({ _id: branchId, landlordId: req.user.landlordId });
          if (branch && branch.priceTiers) {
            const tier = branch.priceTiers.id(req.body.priceTierId);
            if (tier) {
              updateData.price = tier.price;
            }
          }
        }
      } else if (req.body.priceTierId === null || req.body.priceTierId === '') {
        updateData.priceTierId = null;
      }
    }

    const room = await Room.findOneAndUpdate(
      query,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng hoặc bạn không có quyền cập nhật' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
exports.deleteRoom = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId };
    
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    if (req.user.role === 'manager') {
      return res.status(403).json({ success: false, message: 'Manager không có quyền xóa phòng' });
    }
    const room = await Room.findOneAndDelete(query);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng hoặc bạn không có quyền xóa' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
