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
  Grid,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5005/api/users/managers');
      setManagers(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách quản lý');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/branches');
      setBranches(response.data.data);
    } catch (error) {
      console.error('Không thể tải danh sách chi nhánh');
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      if (editingManager) {
        form.setFieldsValue({
          ...editingManager,
          assignedBranches: editingManager.assignedBranches?.map(b => b._id || b)
        });
      } else {
        form.resetFields();
      }
    }
  }, [isModalVisible, editingManager, form]);

  const showModal = (manager = null) => {
    setEditingManager(manager);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingManager(null);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingManager) {
        await axios.put(`http://localhost:5005/api/users/managers/${editingManager._id}`, values);
        message.success('Cập nhật thông tin thành công');
      } else {
        await axios.post('http://localhost:5005/api/users/managers', values);
        message.success('Thêm quản lý mới thành công');
      }
      setIsModalVisible(false);
      fetchManagers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const deleteManager = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa nhân viên quản lý này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5005/api/users/managers/${id}`);
          message.success('Xóa thành công');
          fetchManagers();
        } catch (error) {
          message.error('Không thể xóa');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Quản lý',
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
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text size="small"><MailOutlined /> {record.email}</Typography.Text>
          <Typography.Text size="small" type="secondary"><PhoneOutlined /> {record.phoneNumber || 'N/A'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Khu vực phụ trách',
      dataIndex: 'assignedBranches',
      key: 'assignedBranches',
      render: (assigned) => (
        <Space wrap>
          {assigned && assigned.length > 0 ? (
            assigned.map(branch => (
              <Tag key={branch._id || branch} color="blue">{branch.name || 'Chi nhánh'}</Tag>
            ))
          ) : (
            <Tag color="default">Chưa phân vùng</Tag>
          )}
        </Space>
      ),
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
              onClick={() => deleteManager(record._id)} 
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
                backgroundColor: '#e6f7ff', 
                padding: isMobile ? '8px' : '12px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <SafetyCertificateOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#1890ff' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Quản lý Nhân sự</Title>
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  Quản lý danh sách quản lý và phân vùng phụ trách
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
              style={{ borderRadius: '8px', width: isMobile ? '100%' : 'auto' }}
            >
              Thêm quản lý mới
            </Button>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={managers} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingManager ? "Chỉnh sửa nhân sự" : "Thêm quản lý mới"}
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
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn B" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="manager@example.com" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="091xxxxxxx" />
          </Form.Item>

          <Form.Item
            name="assignedBranches"
            label="Khu vực phụ trách"
            rules={[{ required: true, message: 'Vui lòng phân ít nhất một khu vực' }]}
          >
            <Select mode="multiple" placeholder="Chọn các chi nhánh quản lý">
              {branches.map(branch => (
                <Option key={branch._id} value={branch._id}>{branch.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {!editingManager && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              initialValue="123456"
            >
              <Input.Password placeholder="Mặc định: 123456" />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingManager ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Managers;
