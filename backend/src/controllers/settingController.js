const SystemSetting = require('../models/SystemSetting');

// @desc    Lấy cấu hình hệ thống
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ landlordId: req.user.landlordId });
    
    // Nếu chưa có thì tạo mới một cái mặc định
    if (!settings) {
      settings = await SystemSetting.create({
        landlordId: req.user.landlordId,
        roomTypePrices: [
          { typeName: 'Phòng đơn', price: 1500000 },
          { typeName: 'Phòng đôi', price: 2500000 }
        ]
      });
    }
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật cấu hình hệ thống
// @route   PATCH /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ landlordId: req.user.landlordId });
    
    if (!settings) {
      req.body.landlordId = req.user.landlordId;
      settings = new SystemSetting(req.body);
    } else {
      // Cập nhật các trường gửi lên
      Object.assign(settings, req.body);
    }
    
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
