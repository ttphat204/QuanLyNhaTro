import React from 'react';
import { useAuth } from '../context/AuthContext';
import LandlordDashboard from './LandlordDashboard';
import ManagerDashboard from './ManagerDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import TenantDashboard from './TenantDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'landlord':
      return <LandlordDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'tenant':
      return <TenantDashboard />;
    default:
      return <LandlordDashboard />;
  }
};

export default Dashboard;

