const express = require('express');
const {
  getContracts,
  createContract,
  updateContractStatus,
  deleteContract,
  getMyContracts
} = require('../controllers/contractController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Route cho Tenant (phải đặt trước route có authorize('admin'))
router.get('/my-contracts', getMyContracts);

// Routes cho Admin
router.use(authorize('landlord', 'manager', 'super_admin'));

router
  .route('/')
  .get(getContracts)
  .post(createContract);

router
  .route('/:id')
  .delete(deleteContract);

router.put('/:id/status', updateContractStatus);

module.exports = router;
