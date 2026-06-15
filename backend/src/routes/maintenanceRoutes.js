const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Tenant routes
router.post('/', authorize('tenant'), createRequest);
router.get('/my', authorize('tenant'), getMyRequests);

// Landlord / Manager routes
router.get('/', authorize('landlord', 'manager'), getAllRequests);
router.patch('/:id', authorize('landlord', 'manager'), updateRequestStatus);

module.exports = router;
