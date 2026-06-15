const Expense = require('../models/Expense');

// @desc    Tạo chi phí mới (Landlord / Manager)
// @route   POST /api/expenses
// @access  Private/Landlord/Manager
exports.createExpense = async (req, res) => {
  try {
    const { branchId, title, amount, category, date, note } = req.body;
    const landlordId = req.user.landlordId || req.user._id;

    // Phân quyền cho manager
    if (req.user.role === 'manager' && !req.user.assignedBranches.some(b => b.toString() === branchId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm chi phí cho chi nhánh này.'
      });
    }

    const newExpense = await Expense.create({
      landlordId,
      branchId,
      title,
      amount: Number(amount),
      category: category || 'other',
      date: date || new Date(),
      note
    });

    res.status(201).json({
      success: true,
      data: newExpense
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả chi phí (Landlord / Manager)
// @route   GET /api/expenses
// @access  Private/Landlord/Manager
exports.getExpenses = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId || req.user._id };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    const expenses = await Expense.find(query)
      .populate('branchId', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa chi phí (Landlord / Manager)
// @route   DELETE /api/expenses/:id
// @access  Private/Landlord/Manager
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi phí.'
      });
    }

    // Phân quyền cho manager
    if (req.user.role === 'manager' && !req.user.assignedBranches.some(b => b.toString() === expense.branchId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa chi phí tại chi nhánh này.'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa chi phí thành công.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
