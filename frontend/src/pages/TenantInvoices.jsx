import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col, 
  Modal, 
  Descriptions,
  Grid,
  DatePicker,
  Select,
  message
} from 'antd';
import { 
  FileProtectOutlined, 
  EyeOutlined, 
  CreditCardOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TenantInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    fetchMyInvoices();
  }, [selectedMonth, statusFilter]);

  const fetchMyInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedMonth) {
        params.month = selectedMonth.month() + 1;
        params.year = selectedMonth.year();
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await axios.get('http://localhost:5005/api/invoices/my-invoices', { params });
      setInvoices(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const showInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Tháng/Năm',
      key: 'monthYear',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.month}/{record.year}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.invoiceNumber}</Text>
        </Space>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <Text strong style={{ color: '#1890ff' }}>{val.toLocaleString('en-US')} VNĐ</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { pending: 'orange', paid: 'green', overdue: 'red' };
        const labels = { pending: 'Chưa thanh toán', paid: 'Đã thanh toán', overdue: 'Quá hạn' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => showInvoiceDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status !== 'paid' && (
            <Button 
              size="small" 
              type="primary" 
              icon={<CreditCardOutlined />}
              style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
              onClick={() => showInvoiceDetails(record)}
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '0' : '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card variant="borderless" style={{ borderRadius: '12px' }} styles={{ body: { padding: isMobile ? '16px' : '24px' } }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space size="middle">
                  <div style={{ backgroundColor: '#fff7e6', padding: '12px', borderRadius: '8px' }}>
                    <CreditCardOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                  </div>
                  <div>
                    <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Hóa đơn của tôi</Title>
                    <Text type="secondary">Theo dõi chi tiết tiền phòng và dịch vụ hàng tháng</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Card variant="borderless" style={{ borderRadius: '12px' }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} md={8}>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  format="MM/YYYY"
                  placeholder="Lọc theo tháng"
                  style={{ width: '100%' }}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'pending', label: 'Chưa thanh toán' },
                    { value: 'paid', label: 'Đã thanh toán' },
                    { value: 'overdue', label: 'Quá hạn' },
                  ]}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" style={{ borderRadius: '12px' }}>
        <Table 
          columns={columns} 
          dataSource={invoices} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <FileProtectOutlined />
            <span>Chi tiết Hóa đơn {selectedInvoice?.month}/{selectedInvoice?.year}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>,
          selectedInvoice?.status !== 'paid' && (
            <Button 
              key="refresh" 
              type="dashed" 
              onClick={() => {
                fetchMyInvoices();
                message.loading('Đang kiểm tra giao dịch...', 1.5);
              }}
            >
              Kiểm tra trạng thái
            </Button>
          )
        ]}
        width={700}
      >
        {selectedInvoice && (
          <>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={14}>
                <Descriptions title="Thông tin thanh toán" bordered column={1} size="small">
                  <Descriptions.Item label="Tiền phòng">
                    <Text strong>{selectedInvoice.roomPrice.toLocaleString('en-US')} VNĐ</Text>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Điện & Nước">
                    <Text strong>{(selectedInvoice.electricity.amount + selectedInvoice.water.amount).toLocaleString('en-US')} VNĐ</Text>
                  </Descriptions.Item>
    
                  <Descriptions.Item label="Dịch vụ khác">
                    <Text strong>{selectedInvoice.servicePrice.toLocaleString('en-US')} VNĐ</Text>
                  </Descriptions.Item>
    
                  {selectedInvoice.extraFee > 0 && (
                    <Descriptions.Item label="Phụ thu khác">
                      <Text strong>{selectedInvoice.extraFee.toLocaleString('en-US')} VNĐ</Text>
                      {selectedInvoice.extraNote && (
                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>({selectedInvoice.extraNote})</div>
                      )}
                    </Descriptions.Item>
                  )}
    
                  {selectedInvoice.maintenanceFee > 0 && (
                    <Descriptions.Item label="Phí sửa chữa/Bảo trì">
                      <Text strong>{selectedInvoice.maintenanceFee.toLocaleString('en-US')} VNĐ</Text>
                      {selectedInvoice.maintenanceNote && (
                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>({selectedInvoice.maintenanceNote})</div>
                      )}
                    </Descriptions.Item>
                  )}
    
                  <Descriptions.Item label="Tổng cộng">
                    <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
                      {selectedInvoice.totalAmount.toLocaleString('en-US')} VNĐ
                    </Title>
                  </Descriptions.Item>
    
                  <Descriptions.Item label="Hạn thanh toán">
                    <Space>
                      <CalendarOutlined />
                      {dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY')}
                    </Space>
                  </Descriptions.Item>
    
                  <Descriptions.Item label="Trạng thái">
                    {selectedInvoice.status === 'paid' ? 
                      <Tag color="green">Đã thanh toán lúc {dayjs(selectedInvoice.paidDate).format('HH:mm DD/MM/YYYY')}</Tag> : 
                      <Tag color="orange">Đợi thanh toán</Tag>
                    }
                  </Descriptions.Item>
                </Descriptions>
  
                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '8px' }}>
                  <Title level={5} style={{ color: '#d46b08', marginTop: 0 }}>
                    <InfoCircleOutlined /> Lưu ý quan trọng
                  </Title>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px' }}>
                    <li>Quý khách <strong>KHÔNG ĐƯỢC</strong> sửa nội dung chuyển khoản.</li>
                    <li>Hệ thống tự động đối soát dựa trên mã <strong>QLNT {selectedInvoice.invoiceNumber}</strong>.</li>
                    <li>Nếu sau 5 phút hóa đơn chưa chuyển sang trạng thái "Đã thanh toán", vui lòng liên hệ chủ trọ.</li>
                  </ul>
                </div>
              </Col>
  
              <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                {selectedInvoice.status !== 'paid' && selectedInvoice.qrCode ? (
                  <Card styles={{ body: { padding: '16px' } }} style={{ border: '1px solid #f0f0f0' }}>
                    <Title level={5} style={{ marginTop: 0 }}>Quét mã VietQR</Title>
                    <img 
                      src={selectedInvoice.qrCode} 
                      alt="VietQR Payment" 
                      style={{ width: '100%', maxWidth: '220px', marginBottom: '12px' }} 
                    />
                    <div style={{ backgroundColor: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Nội dung chuyển khoản:</Text>
                      <Text copyable strong style={{ fontSize: '14px', color: '#1890ff' }}>
                        QLNT {selectedInvoice.invoiceNumber}
                      </Text>
                    </div>
                  </Card>
                ) : selectedInvoice.status === 'paid' ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '60px', color: '#52c41a', marginBottom: '16px' }}>✔️</div>
                    <Title level={4}>Cảm ơn bạn!</Title>
                    <Text type="secondary">Hóa đơn đã được thanh toán thành công.</Text>
                  </div>
                ) : (
                  <div style={{ padding: '20px' }}>
                    <Text type="secondary">Mã QR đang được khởi tạo hoặc không khả dụng.</Text>
                  </div>
                )}
              </Col>
            </Row>
  
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '8px' }}>
              <Space align="start">
                <InfoCircleOutlined style={{ color: '#1890ff', marginTop: '4px' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Vui lòng thanh toán hóa đơn đúng hạn để tránh phát sinh chi phí phạt hoặc bị tạm ngưng dịch vụ.
                </Text>
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TenantInvoices;
