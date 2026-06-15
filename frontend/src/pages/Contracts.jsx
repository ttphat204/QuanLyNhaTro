import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  message,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Input,
  InputNumber,
  Grid,
  Checkbox,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  FileTextOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Contracts = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchContracts();
    fetchRooms();
    fetchTenants();
    if (user?.role === 'landlord' || user?.role === 'super_admin') {
      fetchDefaultSettings();
    }
  }, [user]);

  const fetchDefaultSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/settings');
      setDefaultSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings');
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5005/api/contracts');
      setContracts(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/rooms');
      // Only show available rooms for new contracts
      setRooms(response.data.data.filter(r => r.status === 'available'));
    } catch (error) {
      console.error('Error fetching rooms');
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/users/tenants');
      setTenants(response.data.data);
    } catch (error) {
      console.error('Error fetching tenants');
    }
  };

  const showModal = () => {
    form.resetFields();
    form.setFieldsValue({
      hasWifi: true,
      hasTrash: true,
      hasOtherService: false,
      otherServicePrice: 0,
      waterType: 'per_m3'
    });
    setIsModalVisible(true);
  };

  const handleRoomChange = (roomId) => {
    const selectedRoom = rooms.find(r => r._id === roomId);
    if (selectedRoom && selectedRoom.branchId) {
      const branch = selectedRoom.branchId;
      form.setFieldsValue({
        electricityPrice: branch.electricityPrice || 3500,
        waterPrice: branch.waterPrice || 20000,
        waterType: 'per_m3',
        wifiPrice: branch.internetPrice || 100000,
        trashPrice: branch.garbagePrice || 50000,
        rentPrice: branch.defaultRoomPrice || selectedRoom.price
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
      };
      delete payload.dateRange;

      await axios.post('http://localhost:5005/api/contracts', payload);
      message.success('Tạo hợp đồng mới thành công');
      setIsModalVisible(false);
      fetchContracts();
      fetchRooms(); // Refresh available rooms
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5005/api/contracts/${id}/status`, { status });
      message.success('Cập nhật trạng thái thành công');
      fetchContracts();
      fetchRooms();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const deleteContract = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa hợp đồng này? Phòng liên quan sẽ trở về trạng thái Trống.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5005/api/contracts/${id}`);
          message.success('Xóa hợp đồng thành công');
          fetchContracts();
          fetchRooms();
        } catch (error) {
          message.error('Không thể xóa hợp đồng');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Số HĐ',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
      render: (room) => room ? `Phòng ${room.roomNumber}` : 'N/A',
    },
    {
      title: 'Người thuê',
      dataIndex: 'tenant',
      key: 'tenant',
      render: (tenant) => tenant ? tenant.fullName : 'N/A',
    },
    {
      title: 'Thời hạn',
      key: 'period',
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Giá thuê/tháng',
      key: 'rentPrice',
      render: (_, record) => {
        const base = record.basePrice || record.rentPrice;
        const isDifferent = record.rentPrice !== base;
        const drift = record.rentPrice - base;
        
        return (
          <Space direction="vertical" size={0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong>{record.rentPrice?.toLocaleString('en-US')} VNĐ</Text>
              {isDifferent && (
                <Tag color={drift < 0 ? 'volcano' : 'green'} style={{ margin: 0, fontSize: '10px' }}>
                  {drift < 0 ? '-' : '+'}{Math.abs(drift).toLocaleString('en-US')} VNĐ
                </Tag>
              )}
            </div>
            {isDifferent && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Giá niêm yết: <Text delete>{base?.toLocaleString('en-US')} VNĐ</Text>
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Tiền cọc',
      dataIndex: 'deposit',
      key: 'deposit',
      render: (val) => `${val?.toLocaleString('en-US')} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let label = 'Đang hiệu lực';
        if (status === 'expired') {
          color = 'orange';
          label = 'Hết hạn';
        } else if (status === 'terminated') {
          color = 'red';
          label = 'Đã thanh lý';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'active' && (
            <Button 
              size="small" 
              type="primary" 
              danger 
              onClick={() => updateStatus(record._id, 'terminated')}
            >
              Thanh lý
            </Button>
          )}
          <Button 
            size="small" 
            type="text" 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => deleteContract(record._id)} 
          />
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
                backgroundColor: '#fff7e6', 
                padding: isMobile ? '8px' : '12px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FileTextOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#fa8c16' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Quản lý Hợp đồng</Title>
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  Quản lý việc cho thuê và thời hạn
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size={isMobile ? "middle" : "large"} 
              onClick={showModal}
              style={{ borderRadius: '8px', backgroundColor: '#fa8c16', borderColor: '#fa8c16', width: isMobile ? '100%' : 'auto' }}
            >
              Tạo hợp đồng mới
            </Button>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={contracts} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Tạo hợp đồng thuê phòng"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ deposit: 0 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room"
                label="Chọn phòng trống"
                rules={[{ required: true, message: 'Vui lòng chọn phòng' }]}
              >
                <Select placeholder="Chọn số phòng" onChange={handleRoomChange}>
                  {rooms.map(room => (
                    <Option key={room._id} value={room._id}>
                      Phòng {room.roomNumber} ({(room.price || room.branchId?.defaultRoomPrice || 0).toLocaleString('en-US')} VNĐ)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tenant"
                label="Người thuê"
                rules={[{ required: true, message: 'Vui lòng chọn người thuê' }]}
              >
                <Select placeholder="Chọn khách thuê">
                  {tenants.map(tenant => (
                    <Option key={tenant._id} value={tenant._id}>
                      {tenant.fullName} ({tenant.phoneNumber})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label="Thời hạn hợp đồng"
            rules={[{ required: true, message: 'Vui lòng chọn thời hạn' }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Divider orientation="left" style={{ margin: '12px 0' }}>Giá điện & nước</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="electricityPrice" label="Giá điện (VNĐ/kWh)" rules={[{ required: true }]}>
                <InputNumber 
                  style={{ width: '100%' }} 
                  disabled 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="waterPrice" label="Giá nước (VNĐ/m3)" rules={[{ required: true }]}>
                <InputNumber 
                  style={{ width: '100%' }} 
                  disabled 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Form.Item name="waterType" noStyle initialValue="per_m3">
              <input type="hidden" />
            </Form.Item>
          </Row>

          <Divider orientation="left" style={{ margin: '12px 0' }}>Dịch vụ đăng ký</Divider>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item name="hasWifi" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>Sử dụng Wifi</Checkbox>
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.hasWifi !== curr.hasWifi}>
                {({ getFieldValue }) => getFieldValue('hasWifi') && (
                  <Form.Item name="wifiPrice" label="Phí Wifi (VNĐ/tháng)" style={{ marginTop: 8 }}>
                    <InputNumber 
                      style={{ width: '100%' }} 
                      disabled 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hasTrash" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>Phí rác</Checkbox>
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.hasTrash !== curr.hasTrash}>
                {({ getFieldValue }) => getFieldValue('hasTrash') && (
                  <Form.Item name="trashPrice" label="Phí rác (VNĐ/tháng)" style={{ marginTop: 8 }}>
                    <InputNumber 
                      style={{ width: '100%' }} 
                      disabled 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '12px 0' }}>Giá thuê & Cọc</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rentPrice"
                label="Giá thuê thực tế (VNĐ/tháng)"
                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                extra={
                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.room !== curr.room || prev.rentPrice !== curr.rentPrice}>
                    {({ getFieldValue }) => {
                      const roomId = getFieldValue('room');
                      const rentPrice = getFieldValue('rentPrice');
                      const room = rooms.find(r => r._id === roomId);
                      if (room) {
                        const basePrice = room.branchId?.defaultRoomPrice || room.price;
                        const isDiscounted = rentPrice < basePrice;
                        const isIncreased = rentPrice > basePrice;
                        return (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Giá niêm yết (Chi nhánh): <Text strong>{basePrice?.toLocaleString('en-US')} VNĐ</Text>
                            </Text>
                            {isDiscounted && (
                              <Tag color="error" style={{ marginLeft: 8, fontSize: '10px' }}>Giảm giá {((basePrice - rentPrice) / basePrice * 100).toFixed(0)}%</Tag>
                            )}
                            {isIncreased && (
                              <Tag color="success" style={{ marginLeft: 8, fontSize: '10px' }}>Tăng giá {((rentPrice - basePrice) / basePrice * 100).toFixed(0)}%</Tag>
                            )}
                          </div>
                        );
                      }
                      return "Nhập giá cuối cùng đã thống nhất với khách";
                    }}
                  </Form.Item>
                }
              >
                <InputNumber 
                  style={{ width: '100%', fontWeight: 'bold' }} 
                  disabled={isManager}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deposit"
                label="Tiền cọc (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập tiền cọc' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="note"
            label="Ghi chú & Lý do điều chỉnh giá (nếu có)"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const rentPrice = getFieldValue('rentPrice');
                  // We'll set a local state or ref to room price to compare here if we wanted strict validation
                  // For now, let's just make it a text area
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Ví dụ: Giảm giá cho người quen, tăng giá do lắp thêm máy lạnh..." 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '16px' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}>
                Ký hợp đồng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Contracts;
