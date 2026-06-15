const Branch = require('../models/Branch');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private (Landlord, Manager)
exports.getBranches = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId };
    
    // If manager, only show assigned branches
    if (req.user.role === 'manager') {
      query._id = { $in: req.user.assignedBranches };
    }

    const branches = await Branch.find(query);
    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private
exports.getBranch = async (req, res) => {
  try {
    let query = { _id: req.params.id, landlordId: req.user.landlordId };
    
    if (req.user.role === 'manager') {
      query._id = { $in: req.user.assignedBranches };
    }

    const branch = await Branch.findOne(query);
    
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh' });
    }
    
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private (Landlord)
exports.createBranch = async (req, res) => {
  try {
    if (req.user.role !== 'landlord' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Chỉ chủ nhà mới có quyền tạo chi nhánh' });
    }

    req.body.landlordId = req.user.landlordId;
    const branch = await Branch.create(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Tên chi nhánh đã tồn tại' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (Landlord)
exports.updateBranch = async (req, res) => {
  try {
    if (req.user.role !== 'landlord' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Chỉ chủ nhà mới có quyền cập nhật chi nhánh' });
    }

    const oldBranch = await Branch.findOne({ _id: req.params.id, landlordId: req.user.landlordId });
    if (!oldBranch) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh' });
    }

    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, landlordId: req.user.landlordId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh' });
    }

    // Sync Room prices if priceTiers prices were changed, and handle deleted tiers
    if (branch.priceTiers && oldBranch.priceTiers) {
      const Room = require('../models/Room');
      
      // 1. Sync updated tier prices
      for (const newTier of branch.priceTiers) {
        const oldTier = oldBranch.priceTiers.id(newTier._id);
        if (oldTier && oldTier.price !== newTier.price) {
          // Price changed! Update all rooms in this branch linked to this tier
          await Room.updateMany(
            { branchId: branch._id, priceTierId: newTier._id },
            { price: newTier.price }
          );
        }
      }

      // 2. Clear priceTierId for rooms linked to deleted tiers
      const newTierIds = branch.priceTiers.map(t => t._id.toString());
      for (const oldTier of oldBranch.priceTiers) {
        if (!newTierIds.includes(oldTier._id.toString())) {
          await Room.updateMany(
            { branchId: branch._id, priceTierId: oldTier._id },
            { $set: { priceTierId: null } }
          );
        }
      }
    }

    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (Landlord)
exports.deleteBranch = async (req, res) => {
  try {
    if (req.user.role !== 'landlord' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Chỉ chủ nhà mới có quyền xóa chi nhánh' });
    }

    const branch = await Branch.findOneAndDelete({ 
      _id: req.params.id, 
      landlordId: req.user.landlordId 
    });

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
