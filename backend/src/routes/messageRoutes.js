const express = require('express');
const { getMessagesByRoom } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:roomId', getMessagesByRoom);

module.exports = router;
