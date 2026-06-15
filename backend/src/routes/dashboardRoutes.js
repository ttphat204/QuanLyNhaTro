const express = require('express');
const router = express.Router();
const { getAdminStats, getTenantStats, getManagerStats, getRevenueAuditing, getSuperAdminStats, getFinancialReport } = require('../controllers/dashboardController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAdminStats);
router.get('/manager', protect, admin, getManagerStats);
router.get('/audit', protect, admin, getRevenueAuditing);
router.get('/financial', protect, admin, getFinancialReport);
router.get('/tenant', protect, getTenantStats);
router.get('/superadmin', protect, authorize('super_admin'), getSuperAdminStats);


module.exports = router;
