const Message = require('../models/Message');
const Room = require('../models/Room');

// @desc    Get all messages for a specific room
// @route   GET /api/messages/:roomId
// @access  Private
exports.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify room exists and user has access (tenant of the room or admin/manager)
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    }

    // Tenant can only view their own room's messages
    if (req.user.role === 'tenant') {
      if (!room.currentTenant || room.currentTenant.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem tin nhắn phòng này' });
      }
    } else if (req.user.role === 'manager') {
      // Manager can only view if room is in their assigned branches
      if (!req.user.assignedBranches.includes(room.branchId.toString())) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý phòng này' });
      }
    } else if (req.user.role === 'landlord') {
       if (room.landlordId.toString() !== req.user.landlordId.toString()) {
          return res.status(403).json({ success: false, message: 'Bạn không có quyền quản lý phòng này' });
       }
    }

    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
