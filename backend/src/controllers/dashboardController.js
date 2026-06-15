const Invoice = require('../models/Invoice');
const Room = require('../models/Room');
const User = require('../models/User');
const Contract = require('../models/Contract');
const Expense = require('../models/Expense');


// @desc    Lấy thống kê tổng quan cho Admin
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId };
    let invoiceQuery = { landlordId: req.user.landlordId };

    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
      invoiceQuery.branchId = { $in: req.user.assignedBranches };
    }

    const totalRooms = await Room.countDocuments(query);
    const occupiedRooms = await Room.countDocuments({ ...query, status: 'occupied' });
    const availableRooms = await Room.countDocuments({ ...query, status: 'available' });
    
    // Total tenants in these rooms/branches
    let tenantQuery = { role: 'tenant', landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      tenantQuery.branchId = { $in: req.user.assignedBranches };
    }
    const totalTenants = await User.countDocuments(tenantQuery);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyInvoices = await Invoice.find({ ...invoiceQuery, month: currentMonth, year: currentYear });
    
    const revenue = monthlyInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingAmount = monthlyInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const unpaidCount = await Invoice.countDocuments({ ...invoiceQuery, status: { $ne: 'paid' } });
    
    // Revenue Auditing (Variance between basePrice and rentPrice)
    const activeContracts = await Contract.find({ ...query, status: 'active' });
    const potentialRevenue = activeContracts.reduce((sum, c) => sum + (c.basePrice || 0), 0);
    const actualRevenue = activeContracts.reduce((sum, c) => sum + (c.rentPrice || 0), 0);
    const variance = actualRevenue - potentialRevenue;

    // Lấy dữ liệu biểu đồ doanh thu và tiêu thụ 6 tháng gần nhất
    const chartData = [];
    const usageData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const invs = await Invoice.find({ ...invoiceQuery, month: m, year: y });
      const rev = invs.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
      const elecUsage = invs.reduce((sum, inv) => sum + (inv.electricity?.usage || 0), 0);
      const waterUsage = invs.reduce((sum, inv) => sum + (inv.water?.usage || 0), 0);
      
      chartData.push({ name: `T${m}/${y}`, revenue: rev });
      usageData.push({ name: `T${m}/${y}`, electricity: elecUsage, water: waterUsage });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalTenants,
        revenue,
        pendingAmount,
        unpaidCount,
        potentialRevenue,
        actualRevenue,
        variance,
        chartData,
        usageData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy thống kê hướng tác vụ cho Manager
// @route   GET /api/dashboard/manager
// @access  Private/Manager
exports.getManagerStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let roomQuery = { landlordId: req.user.landlordId };
    let invoiceQuery = { landlordId: req.user.landlordId };

    if (req.user.role === 'manager') {
      roomQuery.branchId = { $in: req.user.assignedBranches };
      invoiceQuery.branchId = { $in: req.user.assignedBranches };
    }

    // 1. Tìm các phòng chưa nhập số điện nước tháng này
    const allOccupiedRooms = await Room.find({ ...roomQuery, status: 'occupied' });
    const roomsWithInvoice = await Invoice.find({ 
      ...invoiceQuery,
      month: currentMonth, 
      year: currentYear
    }).distinct('room');
    
    const missingReadings = allOccupiedRooms.filter(room => 
      !roomsWithInvoice.some(roomId => roomId.toString() === room._id.toString())
    );

    // 2. Tìm các hóa đơn quá hạn
    const overdueInvoices = await Invoice.find({
      ...invoiceQuery,
      status: 'pending'
    }).populate('room', 'roomNumber').populate('tenant', 'fullName');

    // 3. Đếm các phòng đang trống
    const availableRoomsCount = await Room.countDocuments({ 
      ...roomQuery,
      status: 'available'
    });

    res.status(200).json({
      success: true,
      data: {
        missingReadings: missingReadings.map(r => ({ _id: r._id, roomNumber: r.roomNumber })),
        overdueInvoices,
        availableRoomsCount,
        currentMonth,
        currentYear
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy thống kê tổng quan cho Tenant
// @route   GET /api/dashboard/tenant
// @access  Private/Tenant
exports.getTenantStats = async (req, res) => {
  try {
    const tenantId = req.user._id;

    // Lấy hóa đơn mới nhất
    const latestInvoice = await Invoice.findOne({ tenant: tenantId })
      .sort({ year: -1, month: -1 })
      .populate('room', 'roomNumber');

    // Lấy số dư hoặc nợ (tổng các hóa đơn chưa trả)
    const unpaidInvoices = await Invoice.find({ tenant: tenantId, status: { $ne: 'paid' } });
    const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        latestInvoice,
        totalDebt,
        unpaidCount: unpaidInvoices.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Lấy dữ liệu đối soát doanh thu (Variance Report)
// @route   GET /api/dashboard/audit
// @access  Private/Admin
exports.getRevenueAuditing = async (req, res) => {
  try {
    let query = { landlordId: req.user.landlordId };
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    const contracts = await Contract.find(query)
      .populate('branchId', 'name')
      .populate('room', 'roomNumber');

    // Group by branch
    const branchStats = {};
    contracts.forEach(c => {
      const branchName = c.branchId?.name || 'Chưa phân loại';
      const branchId = c.branchId?._id?.toString() || 'unknown';
      
      if (!branchStats[branchId]) {
        branchStats[branchId] = {
          name: branchName,
          potential: 0,
          actual: 0,
          drift: 0,
          contracts: []
        };
      }
      
      branchStats[branchId].potential += (c.basePrice || 0);
      branchStats[branchId].actual += (c.rentPrice || 0);
      branchStats[branchId].drift += (c.rentPrice - c.basePrice);
      
      if (c.rentPrice !== c.basePrice) {
        branchStats[branchId].contracts.push({
          contractNumber: c.contractNumber,
          roomNumber: c.room?.roomNumber,
          basePrice: c.basePrice,
          rentPrice: c.rentPrice,
          drift: c.rentPrice - c.basePrice,
          note: c.note
        });
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(branchStats)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy thống kê toàn hệ thống cho Super Admin
// @route   GET /api/dashboard/superadmin
// @access  Private/SuperAdmin
exports.getSuperAdminStats = async (req, res) => {
  try {
    const totalLandlords = await User.countDocuments({ role: 'landlord' });
    const totalManagers = await User.countDocuments({ role: 'manager' });
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const totalRooms = await Room.countDocuments();
    const totalContracts = await Contract.countDocuments({ status: 'active' });

    // Doanh thu toàn hệ thống tháng này
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyInvoices = await Invoice.find({ month: currentMonth, year: currentYear, status: 'paid' });
    const totalRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Biểu đồ tăng trưởng landlord theo 6 tháng gần nhất
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const landlordCount = await User.countDocuments({
        role: 'landlord',
        createdAt: { $lte: endOfMonth }
      });
      const tenantCount = await User.countDocuments({
        role: 'tenant',
        createdAt: { $lte: endOfMonth }
      });
      
      growthData.push({
        name: `T${d.getMonth() + 1}/${d.getFullYear()}`,
        landlords: landlordCount,
        tenants: tenantCount
      });
    }

    // Danh sách Landlord mới nhất (5 người)
    const recentLandlords = await User.find({ role: 'landlord' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email phoneNumber createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalLandlords,
        totalManagers,
        totalTenants,
        totalRooms,
        totalContracts,
        totalRevenue,
        growthData,
        recentLandlords
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy báo cáo tài chính (Lãi/Lỗ, Doanh thu, Chi phí)
// @route   GET /api/dashboard/financial
// @access  Private/Admin
exports.getFinancialReport = async (req, res) => {
  try {
    let landlordId = req.user.landlordId || req.user._id;
    let query = { landlordId };
    
    // Nếu là manager, lọc theo chi nhánh được phân công
    if (req.user.role === 'manager') {
      query.branchId = { $in: req.user.assignedBranches };
    }

    if (req.query.branchId) {
      query.branchId = req.query.branchId;
    }

    // Lấy dữ liệu 6 tháng gần nhất
    const financialData = [];
    let totalRevenueSum = 0;
    let totalExpenseSum = 0;

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      // Doanh thu từ hóa đơn đã thanh toán trong tháng m/y
      const invoiceQuery = { ...query, month: m, year: y, status: 'paid' };
      const invoices = await Invoice.find(invoiceQuery);
      const revenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

      // Chi phí trong tháng m/y
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59);
      const expenseQuery = {
        ...query,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      };
      const expenses = await Expense.find(expenseQuery);
      const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      financialData.push({
        name: `T${m}/${y}`,
        month: m,
        year: y,
        revenue,
        expense: totalExpense,
        profit: revenue - totalExpense
      });

      totalRevenueSum += revenue;
      totalExpenseSum += totalExpense;
    }

    // Lấy danh sách chi tiết các khoản chi phí mới nhất
    const recentExpenses = await Expense.find(query)
      .populate('branchId', 'name')
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        financialData,
        totalRevenue: totalRevenueSum,
        totalExpense: totalExpenseSum,
        netProfit: totalRevenueSum - totalExpenseSum,
        recentExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

