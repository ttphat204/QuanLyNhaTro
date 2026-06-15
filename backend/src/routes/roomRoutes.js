const express = require('express');
const {
  getRooms,
  getRoom,
  getMyRoom,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Tenant-only route (before authorize middleware)
router.use(protect);
router.get('/my-room', getMyRoom);

// All remaining room routes require admin role
router.use(authorize('landlord', 'manager', 'super_admin'));

router
  .route('/')
  .get(getRooms)
  .post(createRoom);

router
  .route('/:id')
  .get(getRoom)
  .put(updateRoom)
  .delete(deleteRoom);

module.exports = router;
