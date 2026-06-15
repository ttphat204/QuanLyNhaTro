import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message,
  Typography,
  Row,
  Col,
  Tooltip,
  Avatar,
  Grid
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5005/api/users/tenants');
      setTenants(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách người thuê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      if (editingTenant) {
        form.setFieldsValue(editingTenant);
      } else {
        form.resetFields();
      }
    }
  }, [isModalVisible, editingTenant, form]);

  const showModal = (tenant = null) => {
    setEditingTenant(tenant);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTenant(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingTenant) {
        await axios.put(`http://localhost:5005/api/users/tenants/${editingTenant._id}`, values);
        message.success('Cập nhật thông tin thành công');
      } else {
        await axios.post('http://localhost:5005/api/users/tenants', values);
        message.success('Thêm người thuê mới thành công');
      }
      setIsModalVisible(false);
      fetchTenants();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const deleteTenant = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa người thuê này? Điều này không làm ảnh hưởng đến các dữ liệu lịch sử hóa đơn.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5005/api/users/tenants/${id}`);
          message.success('Xóa người thuê thành công');
          fetchTenants();
        } catch (error) {
          message.error('Không thể xóa người thuê');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: '#bfbfbf' }} />
          {email}
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#bfbfbf' }} />
          {phone || 'Chưa cập nhật'}
        </Space>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => showModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
              onClick={() => deleteTenant(record._id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  return (
    <div style={{ padding: isMobile ? '0' : '24px' }}>
      <Card variant="borderless" style={{ borderRadius: isMobile ? '0' : '12px' }} styles={{ body: { padding: isMobile ? '12px' : '24px' } }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={16}>
            <Space size="middle">
              <div style={{ 
                backgroundColor: '#f6ffed', 
                padding: isMobile ? '8px' : '12px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <TeamOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#52c41a' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Quản lý Người thuê</Title>
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  Danh sách khách thuê đang sử dụng
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size={isMobile ? "middle" : "large"} 
              onClick={() => showModal()}
              style={{ borderRadius: '8px', backgroundColor: '#52c41a', borderColor: '#52c41a', width: isMobile ? '100%' : 'auto' }}
            >
              Thêm người thuê
            </Button>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={tenants} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingTenant ? "Chỉnh sửa thông tin" : "Thêm người thuê mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="090xxxxxxx" />
          </Form.Item>

          {!editingTenant && (
            <Form.Item
              name="password"
              label="Mật khẩu (Mặc định: 123456)"
              extra="Người thuê có thể đổi mật khẩu sau khi đăng nhập"
            >
              <Input.Password placeholder="Để trống nếu dùng mặc định" />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: editingTenant ? '#1890ff' : '#52c41a', borderColor: editingTenant ? '#1890ff' : '#52c41a' }}>
                {editingTenant ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tenants;
