const Contract = require('../models/Contract');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private (Admin)
exports.getContracts = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const contracts = await Contract.find(query)
      .populate('room', 'roomNumber type')
      .populate('tenant', 'fullName email phoneNumber')
      .populate('branchId', 'name');

    res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new contract
// @route   POST /api/contracts
// @access  Private (Admin)
exports.createContract = async (req, res) => {
  try {
    const { room, tenant } = req.body;

    // Check if room belongs to the landlord and (if manager) belongs to their branch
    let roomQuery = { _id: room, landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      roomQuery.branchId = { $in: req.user.assignedBranches };
    }

    const roomDoc = await Room.findOne(roomQuery).populate('branchId');
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng hoặc bạn không có quyền thao tác trên phòng này' });
    }
    if (roomDoc.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Phòng này đang có người thuê' });
    }

    req.body.landlordId = req.user.landlordId;
    req.body.branchId = roomDoc.branchId._id;
    
    // Ngăn chặn Manager tự ý thay đổi giá phòng và giá dịch vụ khi lên hợp đồng
    if (req.user.role === 'manager') {
      req.body.rentPrice = roomDoc.price;
      req.body.basePrice = roomDoc.price;
      req.body.electricityPrice = roomDoc.branchId.electricityPrice;
      req.body.waterPrice = roomDoc.branchId.waterPrice;
      req.body.wifiPrice = roomDoc.branchId.internetPrice;
      req.body.trashPrice = roomDoc.branchId.garbagePrice;
    } else {
      // Landlord có thể tự đàm phán rentPrice, nhưng basePrice mặc định lưu theo giá niêm yết của phòng để đối soát doanh thu
      req.body.basePrice = roomDoc.price;
    }
    
    const contract = await Contract.create(req.body);

    // Update Room status
    roomDoc.status = 'occupied';
    roomDoc.currentTenant = tenant;
    await roomDoc.save();

    // Update Tenant branchId if not set or different
    await User.findByIdAndUpdate(tenant, { branchId: roomDoc.branchId._id });

    res.status(201).json({ success: true, data: contract });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update contract status
// @route   PUT /api/contracts/:id/status
// @access  Private (Admin)
exports.updateContractStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let query = { _id: req.params.id, landlordId: req.user.landlordId };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const contract = await Contract.findOne(query);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng hoặc bạn không có quyền cập nhật' });
    }

    contract.status = status;
    await contract.save();

    // If terminated or expired, free up the room
    if (status === 'terminated' || status === 'expired') {
      await Room.findOneAndUpdate(
        { _id: contract.room, landlordId: req.user.landlordId },
        { status: 'available', currentTenant: null }
      );
    }

    res.status(200).json({ success: true, data: contract });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private (Admin)
exports.deleteContract = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const contract = await Contract.findOne(query);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng hoặc bạn không có quyền xóa' });
    }

    // Reset room status before deleting contract
    await Room.findOneAndUpdate(
      { _id: contract.room, landlordId: req.user.landlordId },
      { status: 'available', currentTenant: null }
    );

    await contract.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get tenant's own contracts
// @route   GET /api/contracts/my-contracts
// @access  Private (Tenant)
exports.getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ tenant: req.user._id })
      .populate('room', 'roomNumber type floor description')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
