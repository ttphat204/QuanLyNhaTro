const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('landlord', 'super_admin'));

router.route('/')
  .get(getSettings)
  .patch(updateSettings);

module.exports = router;
