import React from 'react';
import { Layout, Menu, Button, theme, Avatar, Space, Grid } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu as MenuIcon,
  CreditCard,
  User,
  History,
  MapPin,
  Contact,
  Wrench,
  TrendingUp,
  Download,
  X
} from 'lucide-react';


const { useBreakpoint } = Grid;

const MainLayout = () => {
  const { Header, Sider, Content } = Layout;
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = React.useState(isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // PWA Installation states
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Ngăn chặn infobar mặc định của Chrome xuất hiện trên thiết bị di động
      e.preventDefault();
      // Lưu lại sự kiện để kích hoạt sau này
      setDeferredPrompt(e);
      // Hiển thị banner cài đặt tuỳ chỉnh của chúng ta
      const isDismissed = sessionStorage.getItem('pwa_install_dismissed');
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Kiểm tra xem ứng dụng đã chạy dưới dạng Standalone chưa (đã được cài đặt)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone
    ) {
      setShowInstallBanner(false);
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      console.log('Ứng dụng PWA đã được cài đặt thành công');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Hiển thị prompt cài đặt hệ điều hành
    deferredPrompt.prompt();
    // Đợi phản hồi từ người dùng
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Kết quả lựa chọn cài đặt của người dùng: ${outcome}`);
    // Đặt lại prompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Close sidebar on navigation if on mobile
  React.useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  const getMenuItems = () => {
    const role = user?.role;

    if (role === 'super_admin') {
      return [
        { key: '/', icon: <LayoutDashboard size={18} />, label: 'SaaS Dashboard' },
        { key: '/landlords', icon: <Users size={18} />, label: 'Quản lý Chủ nhà' },
        { key: '/payments', icon: <History size={18} />, label: 'Giao dịch hệ thống' },
      ];
    }

    if (role === 'landlord') {
      return [
        { key: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { key: '/branches', icon: <MapPin size={18} />, label: 'Quản lý Chi nhánh' },
        { key: '/managers', icon: <Contact size={18} />, label: 'Quản lý Nhân sự' },
        { key: '/settings', icon: <Settings size={18} />, label: 'Cấu hình ngân hàng' },
        { key: '/maintenance', icon: <Wrench size={18} />, label: 'Bảo trì & Sự cố' },
        { key: '/financial', icon: <TrendingUp size={18} />, label: 'Báo cáo tài chính' },
      ];
    }


    if (role === 'manager') {
      return [
        { key: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard Vận hành' },
        { key: '/rooms', icon: <Home size={18} />, label: 'Quản lý Phòng' },
        { key: '/tenants', icon: <Users size={18} />, label: 'Người thuê' },
        { key: '/contracts', icon: <FileText size={18} />, label: 'Hợp đồng' },
        { key: '/invoices', icon: <CreditCard size={18} />, label: 'Hóa đơn' },
        { key: '/maintenance', icon: <Wrench size={18} />, label: 'Bảo trì & Sự cố' },
        { key: '/chat', icon: <MessageSquare size={18} />, label: 'Hỗ trợ khách thuê' },
      ];
    }


    if (role === 'tenant') {
      return [
        { key: '/tenant', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
        { key: '/tenant/invoices', icon: <CreditCard size={18} />, label: 'Hóa đơn' },
        { key: '/tenant/contracts', icon: <FileText size={18} />, label: 'Hợp đồng' },
        { key: '/tenant/chat', icon: <MessageSquare size={18} />, label: 'Chat với chủ nhà' },
        { key: '/tenant/maintenance', icon: <Wrench size={18} />, label: 'Bảo trì & Sự cố' },
      ];
    }


    return [];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        onCollapse={(collapsed) => {
          setCollapsed(collapsed);
        }}
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light" 
        style={{ 
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          position: isMobile ? 'fixed' : 'relative',
          height: '100vh',
          zIndex: 1001
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#1677ff' }}>
          {collapsed ? 'QLNT' : 'QuanLyNhaTro'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ position: 'absolute', bottom: 16, width: '100%', padding: '0 16px' }}>
          <Button 
            type="text" 
            icon={<LogOut size={18} />} 
            block 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {!collapsed && 'Đăng xuất'}
          </Button>
        </div>
      </Sider>
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 0 : 0) }}>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
          <Button
            type="text"
            icon={<MenuIcon size={20} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ paddingRight: isMobile ? 12 : 24 }}>
            <Space size={isMobile ? "small" : "middle"}>
              <NotificationBell />
              {!isMobile && <span style={{ fontWeight: '500' }}>{user?.fullName || 'User'}</span>}
              <Avatar icon={<User size={18} />} style={{ backgroundColor: '#1677ff' }} />
            </Space>
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? '12px 8px' : '24px 16px',
            padding: isMobile ? 12 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      {isMobile && !collapsed && (
        <div 
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 1000
          }}
        />
      )}

      {showInstallBanner && (
        <>
          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div
            style={{
              position: 'fixed',
              bottom: isMobile ? 16 : 24,
              right: isMobile ? 16 : 24,
              left: isMobile ? 16 : 'auto',
              zIndex: 2000,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(22, 119, 255, 0.15)',
              border: '1px solid rgba(22, 119, 255, 0.15)',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: isMobile ? 'calc(100% - 32px)' : '380px',
              animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: '#1677ff', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={20} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#1f1f1f' }}>Cài đặt ứng dụng</h4>
                  <span style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>Trải nghiệm mượt mà hơn</span>
                </div>
              </div>
              <Button 
                type="text" 
                shape="circle" 
                icon={<X size={16} />} 
                onClick={handleDismissInstall} 
                style={{ color: '#bfbfbf', marginTop: -4, marginRight: -4 }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#595959', lineHeight: '1.4' }}>
              Thêm "Quản Lý Nhà Trọ" vào màn hình chính để nhận thông báo tức thời, hoạt động ngoại tuyến và trải nghiệm toàn màn hình như ứng dụng di động thực thụ.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={handleDismissInstall} style={{ borderRadius: '6px' }}>
                Để sau
              </Button>
              <Button size="small" type="primary" onClick={handleInstallClick} style={{ borderRadius: '6px' }} icon={<Download size={14} />}>
                Cài đặt ngay
              </Button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default MainLayout;
