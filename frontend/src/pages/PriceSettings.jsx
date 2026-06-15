import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Form, Button, 
  message, Row, Col, Space, Spin, Input
} from 'antd';
import { 
  SettingOutlined, 
  BankOutlined,
  SaveOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const PriceSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/settings');
      if (response.data.success) {
        form.setFieldsValue(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải cấu hình ngân hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const response = await axios.patch('http://localhost:5005/api/settings', {
        bankInfo: values.bankInfo
      });
      if (response.data.success) {
        message.success('Đã cập nhật tài khoản ngân hàng thành công');
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật tài khoản ngân hàng: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
          <Title level={2} style={{ margin: 0 }}>Cấu hình Tài khoản Ngân hàng (VietQR)</Title>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          {/* Cấu hình Ngân hàng */}
          <Card 
            title={
              <Space>
                <BankOutlined style={{ color: '#1677ff' }} />
                <span>Thông tin thụ hưởng VietQR</span>
              </Space>
            } 
            variant="borderless"
            style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Typography.Paragraph type="secondary" style={{ marginBottom: '24px' }}>
              Thông tin tài khoản ngân hàng này sẽ được dùng để tự động tạo mã **VietQR kèm đúng số tiền và nội dung chuyển khoản** cho khách thuê quét thanh toán trên từng hóa đơn.
            </Typography.Paragraph>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item 
                  name={['bankInfo', 'bankId']} 
                  label="Mã ngân hàng (ID)"
                  rules={[{ required: true, message: 'Vui lòng nhập mã ngân hàng' }]}
                  extra="Ví dụ: MB, VCB, BIDV, ICB (VietinBank)..."
                >
                  <Input placeholder="MB" style={{ borderRadius: '6px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  name={['bankInfo', 'accountNo']} 
                  label="Số tài khoản ngân hàng"
                  rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
                >
                  <Input placeholder="Nhập số tài khoản" style={{ borderRadius: '6px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  name={['bankInfo', 'accountName']} 
                  label="Tên chủ tài khoản"
                  rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}
                  extra="Viết hoa, không dấu"
                >
                  <Input placeholder="NGUYEN VAN A" style={{ borderRadius: '6px' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<SaveOutlined />} 
              htmlType="submit" 
              loading={saving}
              style={{ borderRadius: '8px', paddingLeft: '24px', paddingRight: '24px' }}
            >
              Lưu cấu hình tài khoản
            </Button>
          </div>
        </Form>
      </Space>
    </div>
  );
};

export default PriceSettings;
