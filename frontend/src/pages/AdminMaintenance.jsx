import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Table, Tag, Button, Modal, Form, Input, Select, InputNumber, message, Spin, Space, Image, Flex } from 'antd';
import { Wrench, Eye, Clock, CheckCircle2, XCircle, AlertTriangle, User, UserCheck } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { TextArea } = Input;
const MotionDiv = motion.div;

const palette = {
  primary: '#635BFF',
  cyan: '#00E5E5',
  rose: '#EF5777',
  mint: '#00FFC2',
  warm: '#F7971E',
  dark: '#1a1a2e',
  surface: 'rgba(255,255,255,0.55)',
  surfaceBorder: 'rgba(255,255,255,0.18)',
  textPrimary: '#1a1a2e',
  textSecondary: '#6e7191',
};

const glassCard = {
  borderRadius: 22,
  border: `1px solid ${palette.surfaceBorder}`,
  background: palette.surface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
};

const AdminMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState(undefined);
  const [filterStatus, setFilterStatus] = useState(undefined);
  
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch branches
      const branchRes = await axios.get('http://localhost:5005/api/branches');
      setBranches(branchRes.data.data);

      // Fetch requests
      const params = {};
      if (filterBranch) params.branchId = filterBranch;
      if (filterStatus) params.status = filterStatus;

      const requestRes = await axios.get('http://localhost:5005/api/maintenance', { params });
      setRequests(requestRes.data.data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải dữ liệu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterBranch, filterStatus]);

  const handleProcessRequest = async (values) => {
    try {
      setSubmitting(true);
      await axios.patch(`http://localhost:5005/api/maintenance/${selectedRequest._id}`, values);
      message.success('Đã cập nhật trạng thái sự cố thành công');
      setIsProcessModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="warning" icon={<Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}>Chờ duyệt</Tag>;
      case 'approved':
        return <Tag color="blue" icon={<CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}>Đã duyệt</Tag>;
      case 'in_progress':
        return <Tag color="orange" icon={<Wrench size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}>Đang sửa</Tag>;
      case 'completed':
        return <Tag color="success" icon={<CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}>Đã hoàn thành</Tag>;
      case 'rejected':
        return <Tag color="error" icon={<XCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}>Từ chối</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'high':
        return <Tag color="red" icon={<AlertTriangle size={12} style={{ marginRight: 4 }} />}>Khẩn cấp</Tag>;
      case 'medium':
        return <Tag color="orange">Trung bình</Tag>;
      default:
        return <Tag color="blue">Thấp</Tag>;
    }
  };

  const columns = [
    {
      title: 'Phòng',
      key: 'room',
      render: (_, record) => (
        <div>
          <Text strong>{record.room?.roomNumber || 'N/A'}</Text>
          <div style={{ fontSize: 11, color: palette.textSecondary }}>{record.branchId?.name}</div>
        </div>
      ),
    },
    {
      title: 'Khách thuê',
      key: 'tenant',
      render: (_, record) => (
        <div>
          <Text>{record.tenant?.fullName || 'N/A'}</Text>
          <div style={{ fontSize: 11, color: palette.textSecondary }}>{record.tenant?.phoneNumber}</div>
        </div>
      ),
    },
    {
      title: 'Ngày báo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<Eye size={16} />}
          onClick={() => {
            setSelectedRequest(record);
            form.setFieldsValue({
              status: record.status,
              assignedTo: record.assignedTo,
              cost: record.cost,
              notes: record.notes,
              paidBy: record.paidBy || 'landlord'
            });
            setIsProcessModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', color: palette.primary }}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 0' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Space>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${palette.primary} 0%, #8B5CF6 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wrench size={20} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Quản lý Bảo trì & Sự cố</Title>
            <Text type="secondary">Xử lý các báo cáo hỏng hóc từ người thuê phòng</Text>
          </div>
        </Space>
      </Flex>

      {/* Lọc */}
      <Card style={{ ...glassCard, marginBottom: 20 }}>
        <Space size="middle" wrap>
          <div>
            <Text type="secondary" block style={{ marginBottom: 6 }}>Chi nhánh</Text>
            <Select
              placeholder="Tất cả chi nhánh"
              style={{ width: 200, borderRadius: 10 }}
              allowClear
              value={filterBranch}
              onChange={(val) => setFilterBranch(val)}
            >
              {branches.map(b => (
                <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <Text type="secondary" block style={{ marginBottom: 6 }}>Trạng thái</Text>
            <Select
              placeholder="Tất cả trạng thái"
              style={{ width: 180, borderRadius: 10 }}
              allowClear
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
            >
              <Select.Option value="pending">Chờ duyệt</Select.Option>
              <Select.Option value="approved">Đã duyệt</Select.Option>
              <Select.Option value="in_progress">Đang sửa</Select.Option>
              <Select.Option value="completed">Đã hoàn thành</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
            </Select>
          </div>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={glassCard}
        >
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="_id"
            pagination={{ pageSize: 8 }}
            scroll={{ x: 700 }}
            style={{ padding: 12 }}
          />
        </MotionDiv>
      </Spin>

      {/* Modal xử lý sự cố */}
      <Modal
        title={<Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Xử lý Yêu cầu Bảo trì</Title>}
        open={isProcessModalOpen}
        onCancel={() => {
          setIsProcessModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={650}
        destroyOnClose
      >
        {selectedRequest && (
          <Row gutter={24} style={{ marginTop: 20 }}>
            {/* Cột thông tin sự cố */}
            <Col span={11} style={{ borderRight: '1px solid #f0f0f0' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Phòng:</Text>
                  <Text strong block>{selectedRequest.room?.roomNumber} - {selectedRequest.branchId?.name}</Text>
                </div>
                <div>
                  <Text type="secondary">Người báo:</Text>
                  <Text block>{selectedRequest.tenant?.fullName} ({selectedRequest.tenant?.phoneNumber})</Text>
                </div>
                <div>
                  <Text type="secondary">Mức khẩn cấp:</Text>
                  <div style={{ marginTop: 4 }}>{getPriorityTag(selectedRequest.priority)}</div>
                </div>
                <div>
                  <Text type="secondary">Mô tả sự cố:</Text>
                  <Card style={{ backgroundColor: '#f8fafc', padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 4 }}>
                    <Text size="small">{selectedRequest.description}</Text>
                  </Card>
                </div>
                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div>
                    <Text type="secondary" block style={{ marginBottom: 4 }}>Hình ảnh sự cố:</Text>
                    <Space wrap>
                      {selectedRequest.images.map((img, i) => (
                        <Image key={i} src={img} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </Col>

            {/* Cột Form xử lý */}
            <Col span={13}>
              <Form form={form} layout="vertical" onFinish={handleProcessRequest}>
                <Form.Item
                  name="status"
                  label={<Text style={{ fontWeight: '500' }}>Trạng thái xử lý</Text>}
                  rules={[{ required: true }]}
                >
                  <Select style={{ borderRadius: 10 }}>
                    <Select.Option value="pending">Chờ duyệt</Select.Option>
                    <Select.Option value="approved">Duyệt & Đặt lịch</Select.Option>
                    <Select.Option value="in_progress">Bắt đầu sửa chữa (Đang tiến hành)</Select.Option>
                    <Select.Option value="completed">Đã hoàn thành</Select.Option>
                    <Select.Option value="rejected">Từ chối giải quyết</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.status !== curr.status}>
                  {({ getFieldValue }) => {
                    const currentStatus = getFieldValue('status');
                    if (currentStatus === 'completed') {
                      return (
                        <Form.Item
                          name="paidBy"
                          label={<Text style={{ fontWeight: '500' }}>Bên chịu chi phí</Text>}
                          initialValue="landlord"
                          rules={[{ required: true }]}
                        >
                          <Select style={{ borderRadius: 10 }}>
                            <Select.Option value="landlord">Chủ nhà chịu (Tính vào Chi phí)</Select.Option>
                            <Select.Option value="tenant">Khách thuê chịu (Cộng vào hóa đơn tháng tới)</Select.Option>
                          </Select>
                        </Form.Item>
                      );
                    }
                    return null;
                  }}
                </Form.Item>

                <Form.Item
                  name="assignedTo"
                  label={<Text style={{ fontWeight: '500' }}>Thợ / Nhân viên phụ trách</Text>}
                >
                  <Input placeholder="Tên thợ hoặc đơn vị sửa chữa" prefix={<User size={14} style={{ color: palette.textSecondary }} />} style={{ borderRadius: 10 }} />
                </Form.Item>

                <Form.Item
                  name="cost"
                  label={<Text style={{ fontWeight: '500' }}>Chi phí thực tế phát sinh (VNĐ)</Text>}
                  help="Nếu hoàn thành, chi phí này sẽ tự động ghi nhận vào sổ quỹ Chi phí bảo trì."
                >
                  <InputNumber
                    style={{ width: '100%', borderRadius: 10 }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)|\s/g, '')}
                    placeholder="Nhập chi phí sửa chữa"
                    min={0}
                  />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label={<Text style={{ fontWeight: '500' }}>Ghi chú / Phản hồi của quản lý</Text>}
                >
                  <TextArea rows={3} placeholder="Ví dụ: Đã hẹn thợ nước sang lúc 9h sáng mai..." style={{ borderRadius: 10 }} />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => setIsProcessModalOpen(false)} style={{ borderRadius: 10 }}>Hủy</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      style={{
                        borderRadius: 10,
                        background: palette.primary,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
                      }}
                    >
                      Cập nhật
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default AdminMaintenance;
