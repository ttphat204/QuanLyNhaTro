import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App as AntApp, Layout } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { message: antdMessage } = AntApp.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    setLoading(false);

    if (result.success) {
      antdMessage.success('Đăng nhập thành công!');
      const isAdmin = ['landlord', 'manager', 'super_admin'].includes(result.user.role);
      if (isAdmin) {
        navigate('/');
      } else {
        navigate('/tenant');
      }
    } else {
      antdMessage.error(result.message);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <Card 
          style={{ 
            maxWidth: 400, 
            width: '100%', 
            borderRadius: 16, 
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              backgroundColor: '#1677ff', 
              borderRadius: 12, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)'
            }}>
              <HomeOutlined style={{ fontSize: 32, color: '#fff' }} />
            </div>
            <Title level={2} style={{ marginBottom: 8 }}>Chào mừng trở lại</Title>
            <Text type="secondary">Hệ thống Quản lý Nhà trọ</Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập Email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                style={{ height: 48, borderRadius: 8, fontSize: 16, fontWeight: 600 }}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Chưa có tài khoản? </Text>
              <Button type="link" style={{ padding: 0 }}>Liên hệ chủ trọ</Button>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default LoginPage;
