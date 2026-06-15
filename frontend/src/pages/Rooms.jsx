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
  Select, 
  message,
  Typography,
  Row,
  Col,
  Tooltip,
  Grid
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const Rooms = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLandlord = user?.role === 'landlord';
  const isManager = user?.role === 'manager';
  const canCRUD = isLandlord || isManager; // Landlord and Manager can add/edit rooms
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isResidentModalVisible, setIsResidentModalVisible] = useState(false);
  const [selectedRoomForResidents, setSelectedRoomForResidents] = useState(null);
  const [branches, setBranches] = useState([]);
  const [form] = Form.useForm();
  const [residentForm] = Form.useForm();
  
  // Price Tiers states
  const [selectedBranchTiers, setSelectedBranchTiers] = useState([]);
  const [isPriceDisabled, setIsPriceDisabled] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const filterBranchId = queryParams.get('branchId');

  useEffect(() => {
    fetchRooms();
    fetchBranches();
  }, [location.search]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5005/api/rooms');
      let data = response.data.data;
      if (filterBranchId) {
        data = data.filter(room => {
          const bId = room.branchId?._id || room.branchId;
          return bId === filterBranchId;
        });
      }
      setRooms(data);
    } catch (error) {
      message.error('Không thể tải danh sách phòng');
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

  const handleBranchChange = (branchId) => {
    const selectedBranch = branches.find(b => b._id === branchId);
    if (selectedBranch) {
      setSelectedBranchTiers(selectedBranch.priceTiers || []);
      form.setFieldsValue({ 
        priceTierId: undefined,
        price: undefined
      });
      setIsPriceDisabled(false);
    } else {
      setSelectedBranchTiers([]);
      setIsPriceDisabled(false);
    }
  };

  const handlePriceTierChange = (tierId) => {
    if (tierId) {
      const selectedTier = selectedBranchTiers.find(t => t._id === tierId);
      if (selectedTier) {
        form.setFieldsValue({ price: selectedTier.price });
        setIsPriceDisabled(true);
      }
    } else {
      setIsPriceDisabled(false);
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      if (editingRoom) {
        const bid = editingRoom.branchId?._id || editingRoom.branchId;
        const selectedBranch = branches.find(b => b._id === bid);
        const tiers = selectedBranch ? (selectedBranch.priceTiers || []) : [];
        setSelectedBranchTiers(tiers);
        
        const hasTier = !!editingRoom.priceTierId;
        setIsPriceDisabled(hasTier);

        form.setFieldsValue({
          ...editingRoom,
          branchId: bid,
          priceTierId: editingRoom.priceTierId || undefined,
          price: editingRoom.price || 0
        });
      } else {
        form.resetFields();
        if (filterBranchId) {
          form.setFieldsValue({ branchId: filterBranchId });
          const selectedBranch = branches.find(b => b._id === filterBranchId);
          setSelectedBranchTiers(selectedBranch ? (selectedBranch.priceTiers || []) : []);
        } else {
          setSelectedBranchTiers([]);
        }
        setIsPriceDisabled(false);
      }
    }
  }, [isModalVisible, editingRoom, form, branches, filterBranchId]);

  const showModal = (room = null) => {
    setEditingRoom(room);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingRoom) {
        await axios.put(`http://localhost:5005/api/rooms/${editingRoom._id}`, values);
        message.success('Cập nhật phòng thành công');
      } else {
        await axios.post('http://localhost:5005/api/rooms', values);
        message.success('Thêm phòng mới thành công');
      }
      setIsModalVisible(false);
      fetchRooms();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleResidentUpdate = async (values) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5005/api/rooms/${selectedRoomForResidents._id}`, {
        residents: values.residents
      });
      message.success('Cập nhật danh sách cư dân thành công');
      setIsResidentModalVisible(false);
      fetchRooms();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể cập nhật danh sách cư dân');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa phòng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5005/api/rooms/${id}`);
          message.success('Xóa phòng thành công');
          fetchRooms();
        } catch (error) {
          message.error('Không thể xóa phòng');
        }
      },
    });
  };

  const baseColumns = [
    {
      title: 'Số phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branchId',
      key: 'branchId',
      render: (branch) => {
        return branch?.name ? <Tag color="cyan">{branch.name}</Tag> : <span style={{ color: '#bfbfbf' }}>N/A</span>;
      },
    },
    {
      title: 'Giá thuê',
      key: 'price',
      render: (_, record) => {
        const branchTiers = record.branchId?.priceTiers || [];
        const tier = branchTiers.find(t => t._id === record.priceTierId);
        const priceVal = record.price || 0;
        return (
          <Space>
            <span style={{ fontWeight: '500' }}>
              {priceVal.toLocaleString('en-US')} VNĐ
            </span>
            {tier && (
              <Tag color="blue" style={{ margin: 0 }}>{tier.name}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let label = 'Trống';
        if (status === 'occupied') {
          color = 'blue';
          label = 'Đang thuê';
        } else if (status === 'maintenance') {
          color = 'volcano';
          label = 'Bảo trì';
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Người thuê hiện tại',
      dataIndex: 'currentTenant',
      key: 'currentTenant',
      render: (tenant) => tenant ? tenant.fullName : <span style={{ color: '#bfbfbf' }}>N/A</span>,
    }
  ];

  const columns = [
    ...baseColumns,
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {canCRUD ? (
            <>
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
                  onClick={() => deleteRoom(record._id)} 
                />
              </Tooltip>
            </>
          ) : isManager ? (
            <Tooltip title="Quản lý cư dân">
              <Button 
                type="text" 
                icon={<InfoCircleOutlined style={{ color: '#52c41a' }} />} 
                onClick={() => {
                  setSelectedRoomForResidents(record);
                  residentForm.setFieldsValue({ residents: record.residents || [] });
                  setIsResidentModalVisible(true);
                }} 
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    }
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
                backgroundColor: '#e6f7ff', 
                padding: isMobile ? '8px' : '12px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <HomeOutlined style={{ fontSize: isMobile ? '20px' : '24px', color: '#1890ff' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Quản lý Phòng</Title>
                <Typography.Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  Danh sách và trạng thái phòng
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            {canCRUD && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size={isMobile ? "middle" : "large"} 
                onClick={() => showModal()}
                style={{ borderRadius: '8px', width: isMobile ? '100%' : 'auto' }}
              >
                Thêm phòng mới
              </Button>
            )}
          </Col>
        </Row>

        {filterBranchId && (
          <div style={{ 
            marginBottom: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#e6f7ff', 
            border: '1px solid #91d5ff', 
            padding: '8px 16px', 
            borderRadius: '6px' 
          }}>
            <span style={{ fontSize: '14px', color: '#0050b3' }}>
              Đang lọc danh sách phòng theo Chi nhánh đã chọn.
            </span>
            <Button type="link" size="small" onClick={() => navigate('/rooms')} style={{ padding: 0 }}>
              Xem tất cả chi nhánh
            </Button>
          </div>
        )}

        <Table 
          columns={columns} 
          dataSource={rooms} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'available' }}
        >
          <Form.Item
            name="branchId"
            label="Chi nhánh/Khu vực"
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
          >
            <Select 
              placeholder="Chọn chi nhánh" 
              onChange={handleBranchChange}
              disabled={isManager ? !!editingRoom : false}
            >
              {branches.map(branch => (
                <Option key={branch._id} value={branch._id}>{branch.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priceTierId"
            label="Mức giá phòng (Price Tier)"
            help={isManager ? (editingRoom ? "Chỉ Chủ nhà mới có quyền thay đổi giá/mức giá phòng đã tạo" : "Chọn mức giá phòng đã được Chủ nhà cài đặt trước") : (isPriceDisabled ? "Giá phòng được khóa theo mức giá đã chọn. Chọn 'Tùy chỉnh' để tự nhập." : undefined)}
          >
            <Select 
              placeholder={isManager ? "Chọn mức giá niêm yết" : "Tùy chỉnh (Tự nhập giá)"}
              allowClear={!isManager} 
              onChange={handlePriceTierChange}
              disabled={isManager ? !!editingRoom : !form.getFieldValue('branchId')}
            >
              {!isManager && <Option value="">Tùy chỉnh (Tự nhập giá)</Option>}
              {selectedBranchTiers.map(tier => (
                <Option key={tier._id} value={tier._id}>
                  {tier.name} ({tier.price.toLocaleString('en-US')} VNĐ)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomNumber"
                label="Số phòng"
                rules={[{ required: true, message: 'Vui lòng nhập số phòng' }]}
              >
                <Input placeholder="Ví dụ: 101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
              >
                <Select>
                  <Option value="available">Trống</Option>
                  <Option value="occupied">Đang thuê</Option>
                  <Option value="maintenance">Bảo trì</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá thuê (VNĐ/tháng)"
                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                help={isManager ? "Giá thuê phòng do Chủ nhà niêm yết (Quản lý không có quyền tự nhập giá)" : undefined}
              >
                <InputNumber 
                  style={{ width: '100%', fontWeight: isManager ? 'bold' : 'normal' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="2,500,000"
                  disabled={isManager || isPriceDisabled}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="area"
                label="Diện tích (m2)"
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả thêm"
          >
            <Input.TextArea rows={3} placeholder="Mô tả về nội thất, tiện ích..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRoom ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#52c41a' }} />
            <span>Quản lý cư dân - Phòng {selectedRoomForResidents?.roomNumber}</span>
          </Space>
        }
        open={isResidentModalVisible}
        onCancel={() => setIsResidentModalVisible(false)}
        onOk={() => residentForm.submit()}
        width={750}
        okText="Lưu danh sách"
        cancelText="Đóng"
        destroyOnClose
      >
        <Typography.Paragraph type="secondary">
          Thêm thông tin các thành viên đang sinh sống tại phòng này để phục vụ khai báo tạm trú.
        </Typography.Paragraph>
        <Form
          form={residentForm}
          layout="vertical"
          onFinish={handleResidentUpdate}
        >
          <Form.List name="residents">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    style={{ marginBottom: 16, borderLeft: '4px solid #52c41a', borderRadius: '8px' }}
                    title={<Text strong>Cư dân {name + 1}</Text>}
                    extra={
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => remove(name)}
                      >
                        Xóa
                      </Button>
                    }
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'fullName']}
                          label="Họ tên"
                          rules={[{ required: true, message: 'Nhập họ tên' }]}
                        >
                          <Input placeholder="Nguyễn Văn A" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'phoneNumber']}
                          label="Số điện thoại"
                        >
                          <Input placeholder="0901234567" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'idCard']}
                          label="Số CCCD"
                        >
                          <Input placeholder="079123456789" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'relationship']}
                          label="Quan hệ"
                        >
                          <Input placeholder="Vợ, Con, Bạn, Người thân..." />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'hometown']}
                          label="Quê quán"
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh" />
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
                    style={{ height: '45px', borderRadius: '8px' }}
                  >
                    Thêm thành viên ở cùng
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Rooms;
