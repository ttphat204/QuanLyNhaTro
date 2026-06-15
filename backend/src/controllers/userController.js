const User = require('../models/User');

// @desc    Get all tenants
// @route   GET /api/users/tenants
// @access  Private (Admin)
exports.getTenants = async (req, res) => {
  try {
    let query = { role: 'tenant', landlordId: req.user.landlordId };

    if (req.user.role === 'manager') {
      query.$or = [
        { branchId: { $in: req.user.assignedBranches } },
        { branchId: { $exists: false } },
        { branchId: null }
      ];
    }

    const tenants = await User.find(query).populate('branchId', 'name');
    res.status(200).json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new tenant
// @route   POST /api/users/tenants
// @access  Private (Admin)
exports.createTenant = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, branchId } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    // If manager is creating, ensure they have access to this branch
    if (req.user.role === 'manager' && branchId && !req.user.assignedBranches.includes(branchId)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền gán người thuê vào chi nhánh này' });
    }

    const tenant = await User.create({
      fullName,
      email,
      password: password || '123456', // Default password
      role: 'tenant',
      phoneNumber,
      branchId,
      landlordId: req.user.landlordId
    });

    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update tenant
// @route   PUT /api/users/tenants/:id
// @access  Private (Admin)
exports.updateTenant = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId, role: 'tenant' };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const tenant = await User.findOneAndUpdate(
      query,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người thuê hoặc bạn không có quyền cập nhật' });
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete tenant
// @route   DELETE /api/users/tenants/:id
// @access  Private (Admin)
exports.deleteTenant = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId, role: 'tenant' };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const tenant = await User.findOneAndDelete(query);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người thuê hoặc bạn không có quyền xóa' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Manager Management
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager', landlordId: req.user.landlordId }).populate('assignedBranches', 'name');
    res.status(200).json({ success: true, count: managers.length, data: managers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createManager = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, assignedBranches } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    const manager = await User.create({ fullName, email, password: password || '123456', role: 'manager', phoneNumber, assignedBranches, landlordId: req.user.landlordId });
    res.status(201).json({ success: true, data: manager });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateManager = async (req, res) => {
  try {
    const manager = await User.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user.landlordId, role: 'manager' },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedBranches', 'name');
    if (!manager) return res.status(404).json({ success: false, message: 'Không tìm thấy quản lý' });
    res.status(200).json({ success: true, data: manager });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    const manager = await User.findOneAndDelete({ _id: req.params.id, landlordId: req.user.landlordId, role: 'manager' });
    if (!manager) return res.status(404).json({ success: false, message: 'Không tìm thấy quản lý' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// @desc    Delete manager
// @route   DELETE /api/users/managers/:id
// @access  Private (Landlord)
exports.deleteManager = async (req, res) => {
  try {
    const manager = await User.findOneAndDelete({ 
      _id: req.params.id, 
      landlordId: req.user.landlordId, 
      role: 'manager' 
    });
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy quản lý' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
