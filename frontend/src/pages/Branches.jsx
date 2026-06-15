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
  InputNumber,
  message,
  Typography,
  Row,
  Col,
  Tooltip,
  Grid,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  GlobalOutlined,
  EnvironmentOutlined,
  HomeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Branches = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5005/api/branches');
      setBranches(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      if (editingBranch) {
        form.setFieldsValue(editingBranch);
      } else {
        form.resetFields();
      }
    }
  }, [isModalVisible, editingBranch, form]);

  const showModal = (branch = null) => {
    setEditingBranch(branch);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBranch(null);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (editingBranch) {
        await axios.put(`http://localhost:5005/api/branches/${editingBranch._id}`, values);
        message.success('Cập nhật chi nhánh thành công');
      } else {
        await axios.post('http://localhost:5005/api/branches', values);
        message.success('Thêm chi nhánh mới thành công');
      }
      setIsModalVisible(false);
      fetchBranches();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const deleteBranch = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Lưu ý: Xóa chi nhánh có thể ảnh hưởng đến các phòng đang thuộc chi nhánh này. Bạn có chắc chắn muốn xóa?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5005/api/branches/${id}`);
          message.success('Xóa chi nhánh thành công');
          fetchBranches();
        } catch (error) {
          message.error('Không thể xóa chi nhánh');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên Chi Nhánh',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (text) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },

    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chi tiết quản lý (Quản lý phòng)">
            <Button 
              type="text" 
              icon={<HomeOutlined style={{ color: '#52c41a' }} />} 
              onClick={() => navigate(`/rooms?branchId=${record._id}`)} 
            />
          </Tooltip>
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
              onClick={() => deleteBranch(record._id)} 
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
      <Card variant="borderless" className="shadow-sm" style={{ borderRadius: isMobile ? '0' : '12px' }} styles={{ body: { padding: isMobile ? '12px' : '24px' } }}>
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
                <GlobalOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#52c41a' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Quản lý Chi nhánh</Title>
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  Phân vùng quản lý cho các khu vực nhà trọ
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
              Thêm chi nhánh mới
            </Button>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={branches} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ 
            isActive: true,
            electricityPrice: 3500,
            waterPrice: 20000,
            internetPrice: 100000,
            garbagePrice: 50000
          }}
        >
          <Form.Item
            name="name"
            label="Tên chi nhánh/khu vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
          >
            <Input placeholder="Ví dụ: Khu vực Quận 1" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ chi tiết..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Mô tả thêm về khu vực này..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="electricityPrice"
                label="Giá điện (VNĐ/kWh)"
                rules={[{ required: true, message: 'Vui lòng nhập giá điện' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 3500" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="waterPrice"
                label="Giá nước (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá nước' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 20000" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="internetPrice"
                label="Giá Internet (VNĐ/tháng)"
                rules={[{ required: true, message: 'Vui lòng nhập giá Internet' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 100000" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="garbagePrice"
                label="Giá rác (VNĐ/tháng)"
                rules={[{ required: true, message: 'Vui lòng nhập giá rác' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 50000" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

          </Row>

          <Divider style={{ margin: '16px 0' }} />
          <Typography.Title level={5} style={{ margin: '0 0 12px 0' }}>
            Mức giá phòng phân cấp (Price Tiers)
          </Typography.Title>
          <Form.List name="priceTiers">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, borderLeft: '4px solid #1890ff', borderRadius: '6px' }}
                    styles={{ body: { padding: '12px' } }}
                    title={<span style={{ fontSize: '14px', fontWeight: 'bold' }}>Mức giá {name + 1}</span>}
                    extra={
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => remove(name)} 
                      />
                    }
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Tên mức giá"
                          rules={[{ required: true, message: 'Nhập tên mức giá' }]}
                        >
                          <Input placeholder="Ví dụ: Standard, VIP" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          label="Đơn giá (VNĐ/tháng)"
                          rules={[{ required: true, message: 'Nhập đơn giá' }]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Ví dụ: 2500000"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="Mô tả / Tiện ích đi kèm"
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Ví dụ: Phòng đơn có gác, ban công thoáng mát" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                    style={{ borderRadius: '6px' }}
                  >
                    Thêm mức giá phòng
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider style={{ margin: '16px 0' }} />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingBranch ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Branches;
