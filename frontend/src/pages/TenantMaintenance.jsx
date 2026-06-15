import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Table, Tag, Button, Modal, Form, Input, Select, Upload, message, Spin, Space, Image, Flex } from 'antd';
import { Wrench, Plus, UploadCloud, AlertTriangle, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
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

const TenantMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5005/api/maintenance/my');
      setRequests(res.data.data);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách yêu cầu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (values) => {
    try {
      setUploading(true);
      // 1. Tải ảnh lên trước nếu có
      const imageUrls = [];
      for (const fileObj of fileList) {
        const formData = new FormData();
        formData.append('image', fileObj.originFileObj);
        const res = await axios.post('http://localhost:5005/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrls.push(res.data.data.url);
      }

      // 2. Gửi ticket bảo trì
      await axios.post('http://localhost:5005/api/maintenance', {
        description: values.description,
        priority: values.priority,
        images: imageUrls
      });

      message.success('Đã gửi yêu cầu bảo trì thành công');
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      fetchRequests();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Mô tả sự cố',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => <Text style={{ color: palette.textPrimary }}>{text}</Text>,
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
            setDetailModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', color: palette.primary }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 0' }}>
      <div style={{ position: 'absolute', top: -100, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,87,119,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <Flex justify="space-between" align="center" style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <Space>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${palette.rose} 0%, #FF6B6B 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wrench size={20} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Bảo trì & Sự cố</Title>
            <Text type="secondary">Báo cáo các hỏng hóc trong phòng trọ của bạn</Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
          style={{
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${palette.primary} 0%, #8B5CF6 100%)`,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
          }}
        >
          Tạo yêu cầu mới
        </Button>
      </Flex>

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
            scroll={{ x: 600 }}
            style={{ padding: 12 }}
          />
        </MotionDiv>
      </Spin>

      {/* Modal tạo yêu cầu bảo trì */}
      <Modal
        title={<Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Gửi Yêu cầu Bảo trì</Title>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        destroyOnClose
        style={{ borderRadius: 18 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest} style={{ marginTop: 16 }}>
          <Form.Item
            name="description"
            label={<Text style={{ fontWeight: '500' }}>Mô tả sự cố</Text>}
            rules={[{ required: true, message: 'Vui lòng mô tả chi tiết sự cố hỏng hóc' }]}
          >
            <TextArea rows={4} placeholder="Ví dụ: Vòi sen phòng tắm bị rò rỉ nước liên tục, nước chảy yếu..." style={{ borderRadius: 10 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label={<Text style={{ fontWeight: '500' }}>Mức độ khẩn cấp</Text>}
                initialValue="medium"
              >
                <Select style={{ borderRadius: 10 }}>
                  <Select.Option value="low">Thấp</Select.Option>
                  <Select.Option value="medium">Trung bình</Select.Option>
                  <Select.Option value="high">Khẩn cấp (Hỏng điện, vỡ ống nước...)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={<Text style={{ fontWeight: '500' }}>Hình ảnh thực tế (nếu có)</Text>}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false} // Không tự upload ngay
              accept="image/*"
              maxCount={3}
            >
              {fileList.length < 3 && (
                <div style={{ textAlign: 'center', color: palette.textSecondary }}>
                  <UploadCloud size={20} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 12 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)} style={{ borderRadius: 10 }}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                style={{
                  borderRadius: 10,
                  background: palette.primary,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
                }}
              >
                Gửi yêu cầu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết yêu cầu bảo trì */}
      <Modal
        title={<Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Chi tiết Yêu cầu Bảo trì</Title>}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)} style={{ borderRadius: 10 }}>Đóng</Button>
        ]}
        width={600}
      >
        {selectedRequest && (
          <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
            <div>
              <Text type="secondary" block>Ngày gửi:</Text>
              <Text strong>{dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" block>Độ ưu tiên:</Text>
                <div style={{ marginTop: 4 }}>{getPriorityTag(selectedRequest.priority)}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary" block>Trạng thái:</Text>
                <div style={{ marginTop: 4 }}>{getStatusTag(selectedRequest.status)}</div>
              </Col>
            </Row>

            <div>
              <Text type="secondary" block>Mô tả sự cố:</Text>
              <Card style={{ backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 4 }}>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedRequest.description}</Text>
              </Card>
            </div>

            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div>
                <Text type="secondary" block style={{ marginBottom: 8 }}>Hình ảnh minh họa:</Text>
                <Space wrap size="small">
                  {selectedRequest.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', borderRadius: 10 }}
                    />
                  ))}
                </Space>
              </div>
            )}

            {selectedRequest.notes && (
              <div>
                <Text type="secondary" block>Phản hồi từ Ban quản lý:</Text>
                <Card style={{ backgroundColor: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginTop: 4 }}>
                  <Text style={{ whiteSpace: 'pre-wrap', color: '#15803d' }}>{selectedRequest.notes}</Text>
                </Card>
              </div>
            )}

            {selectedRequest.assignedTo && (
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary" block>Người sửa chữa:</Text>
                  <Text strong>{selectedRequest.assignedTo}</Text>
                </Col>
                {selectedRequest.cost > 0 && (
                  <Col span={12}>
                    <Text type="secondary" block>Chi phí sửa chữa:</Text>
                    <Text strong style={{ color: palette.rose }}>{selectedRequest.cost.toLocaleString('vi-VN')} VNĐ</Text>
                    <div style={{ marginTop: 4 }}>
                      {selectedRequest.paidBy === 'tenant' ? (
                        <Tag color="orange">Khách thuê chịu (Cộng vào hóa đơn)</Tag>
                      ) : (
                        <Tag color="green">Chủ nhà đài thọ</Tag>
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default TenantMaintenance;
