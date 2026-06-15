import React from 'react';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import TenantDashboard from './pages/TenantDashboard';
import Rooms from './pages/Rooms';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import Invoices from './pages/Invoices';
import PriceSettings from './pages/PriceSettings';
import Payments from './pages/Payments';
import TenantInvoices from './pages/TenantInvoices';
import TenantContracts from './pages/TenantContracts';
import Chat from './pages/Chat';
import Branches from './pages/Branches';
import Managers from './pages/Managers';
import TenantMaintenance from './pages/TenantMaintenance';
import AdminMaintenance from './pages/AdminMaintenance';
import FinancialReport from './pages/FinancialReport';


const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Common Admin Routes (Landlord, Manager, Super Admin) */}
                <Route element={<ProtectedRoute allowedRoles={['landlord', 'manager', 'super_admin']} />}>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="chat" element={<Chat />} />
                    
                    {/* Super Admin specific routes */}
                    <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                      <Route path="landlords" element={<Managers />} /> {/* Assuming Managers component is repurposed for landlords or similar */}
                    </Route>

                    {/* Landlord & Super Admin only routes */}
                    <Route element={<ProtectedRoute allowedRoles={['landlord', 'super_admin']} />}>
                      <Route path="branches" element={<Branches />} />
                      <Route path="managers" element={<Managers />} />
                      <Route path="settings" element={<PriceSettings />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="financial" element={<FinancialReport />} />
                    </Route>


                    {/* Operational Routes (Landlord, Manager, Super Admin) */}
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="maintenance" element={<AdminMaintenance />} />
                  </Route>

                </Route>
  
                {/* Tenant Routes */}
                <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                  <Route path="/tenant" element={<MainLayout />}>
                    <Route index element={<TenantDashboard />} />
                    <Route path="invoices" element={<TenantInvoices />} />
                    <Route path="contracts" element={<TenantContracts />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="maintenance" element={<TenantMaintenance />} />
                  </Route>

                </Route>
  
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
