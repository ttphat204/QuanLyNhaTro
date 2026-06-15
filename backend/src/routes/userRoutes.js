const express = require('express');
const {
  getTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  getManagers,
  createManager,
  updateManager,
  deleteManager
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Tenants can be managed by Landlords and Managers
router
  .route('/tenants')
  .get(authorize('landlord', 'manager', 'super_admin'), getTenants)
  .post(authorize('landlord', 'manager', 'super_admin'), createTenant);

router
  .route('/tenants/:id')
  .put(authorize('landlord', 'manager', 'super_admin'), updateTenant)
  .delete(authorize('landlord', 'manager', 'super_admin'), deleteTenant);

// Managers can only be managed by Landlords and Super Admins
router
  .route('/managers')
  .get(authorize('landlord', 'super_admin'), getManagers)
  .post(authorize('landlord', 'super_admin'), createManager);

router
  .route('/managers/:id')
  .put(authorize('landlord', 'super_admin'), updateManager)
  .delete(authorize('landlord', 'super_admin'), deleteManager);

module.exports = router;
