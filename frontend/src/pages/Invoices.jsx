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
  InputNumber, 
  Tabs,
  Badge,
  Tooltip,
  Grid,
  Select,
  Descriptions,
  Upload,
  Input,
  Checkbox
} from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CalculatorOutlined,
  EyeOutlined,
  DollarOutlined,
  SettingOutlined,
  ScanOutlined,
  LoadingOutlined,
  SendOutlined,
  ToolOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import Tesseract from 'tesseract.js';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Invoices = () => {
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [, forceUpdate] = useState({});
  const [data, setData] = useState([]); // Preparation data
  const [invoices, setInvoices] = useState([]); // History data
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    fetchPreparationData();
    fetchInvoices();
  }, [selectedMonth, statusFilter]);

  const fetchPreparationData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5005/api/invoices/prepare?month=${selectedMonth.month() + 1}&year=${selectedMonth.year()}`);
      setData(response.data.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu chốt điện nước');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const params = {
        month: selectedMonth.month() + 1,
        year: selectedMonth.year(),
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await axios.get('http://localhost:5005/api/invoices', { params });
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Error fetching invoices');
    }
  };

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    const existingInv = record.invoice;
    form.setFieldsValue({
      elecPrevious: existingInv ? existingInv.electricity.previous : record.suggestedReading?.elecPrevious ?? 0,
      elecCurrent: existingInv ? existingInv.electricity.current : record.suggestedReading?.elecPrevious ?? 0,
      waterPrevious: existingInv ? existingInv.water.previous : record.suggestedReading?.waterPrevious ?? 0,
      waterCurrent: existingInv ? existingInv.water.current : record.suggestedReading?.waterPrevious ?? 0,
      waterUsage: existingInv ? existingInv.water.usage : (record.suggestedReading?.waterUsage ?? (record.waterType === 'per_person' ? 1 : 0)),
      hasWifi: record.hasWifi !== undefined ? record.hasWifi : true,
      hasTrash: record.hasTrash !== undefined ? record.hasTrash : true,
      hasOtherService: record.hasOtherService !== undefined ? record.hasOtherService : false,
      maintenanceFee: existingInv ? existingInv.maintenanceFee : record.suggestedReading?.maintenanceFee ?? 0,
      maintenanceNote: existingInv ? existingInv.maintenanceNote : record.suggestedReading?.maintenanceNote ?? '',
    });
    setIsModalVisible(true);
  };

  const showInvoiceDetails = (record) => {
    setSelectedInvoice(record);
    setDetailModalVisible(true);
  };

  const handleSaveInvoice = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5005/api/invoices', {
        ...values,
        contractId: selectedRecord.contractId,
        month: selectedMonth.month() + 1,
        year: selectedMonth.year(),
      });
      message.success('Đã lưu hóa đơn và cập nhật chỉ số');
      setIsModalVisible(false);
      fetchPreparationData();
      fetchInvoices();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, method = 'transfer') => {
    try {
      await axios.put(`http://localhost:5005/api/invoices/${id}/status`, { status, paymentMethod: method });
      message.success('Cập nhật trạng thái thanh toán thành công');
      fetchInvoices();
      fetchPreparationData();
    } catch (error) {
      message.error('Lỗi cập nhật trạng thái');
    }
  };

  const prepColumns = [
    {
      title: 'Phòng',
      dataIndex: ['room', 'roomNumber'],
      key: 'room',
      render: (text) => <Text strong>Phòng {text}</Text>,
    },
    {
      title: 'Người thuê',
      dataIndex: ['tenant', 'fullName'],
      key: 'tenant',
    },
    {
      title: 'Tình trạng',
      key: 'status',
      render: (_, record) => (
        record.invoice ? 
        <Tag color="green" icon={<CheckCircleOutlined />}>Đã chốt số</Tag> : 
        <Tag color="orange" icon={<ExclamationCircleOutlined />}>Chưa chốt số</Tag>
      ),
    },
    {
      title: 'Tổng tiền tạm tính',
      key: 'amount',
      render: (_, record) => record.invoice ? (
        <Text strong style={{ color: '#fa541c' }}>
          {record.invoice.totalAmount.toLocaleString('en-US')} VNĐ
        </Text>
      ) : '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<CalculatorOutlined />} 
          size="small"
          onClick={() => handleOpenModal(record)}
          style={{ borderRadius: '6px' }}
        >
          {record.invoice ? 'Cập nhật số' : 'Chốt số & Tính tiền'}
        </Button>
      ),
    },
  ];

  const invColumns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Phòng',
      dataIndex: ['room', 'roomNumber'],
      key: 'room',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <Text strong>{val.toLocaleString('en-US')} VNĐ</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const labels = { pending: 'Chờ thanh toán', paid: 'Đã thanh toán', overdue: 'Quá hạn' };
        const badgeStatus = status === 'paid' ? 'success' : status === 'overdue' ? 'error' : 'warning';
        return <Badge status={badgeStatus} text={labels[status]} />;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Tooltip title="Xác nhận đã thu tiền">
              <Button 
                type="primary" 
                size="small" 
                icon={<DollarOutlined />}
                onClick={() => updateStatus(record._id, 'paid')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Thu tiền
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => showInvoiceDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Gửi thông báo">
            <Button 
              size="small" 
              icon={<SendOutlined />} 
              onClick={() => message.success('Đã gửi thông báo cho khách thuê!')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '0' : '24px' }}>
      <Card variant="borderless" style={{ borderRadius: isMobile ? '0' : '12px' }} styles={{ body: { padding: isMobile ? '12px' : '24px' } }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={16}>
            <Space size="middle">
              <div style={{ backgroundColor: '#e6f7ff', padding: '12px', borderRadius: '8px' }}>
                <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Quản lý Hóa đơn</Title>
                <Text type="secondary">Nhập chỉ số điện nước và quản lý thanh toán</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <DatePicker 
              picker="month" 
              value={selectedMonth} 
              onChange={setSelectedMonth} 
              format="MM/YYYY"
              allowClear={false}
              style={{ width: isMobile ? '100%' : '200px', borderRadius: '8px' }}
            />
          </Col>
        </Row>
        <Row gutter={[12, 12]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'pending', label: 'Chờ thanh toán' },
                { value: 'paid', label: 'Đã thanh toán' },
                { value: 'overdue', label: 'Quá hạn' },
              ]}
            />
          </Col>
        </Row>

        <Tabs defaultActiveKey="1" style={{ marginTop: '16px' }}>
          <TabPane tab={<span><CalculatorOutlined /> Chốt điện nước</span>} key="1">
            <Table 
              columns={prepColumns} 
              dataSource={data} 
              rowKey="contractId" 
              loading={loading}
              pagination={false}
              scroll={{ x: true }}
            />
          </TabPane>
          <TabPane tab={<span><DollarOutlined /> Lịch sử hóa đơn</span>} key="2">
            <Table 
              columns={invColumns} 
              dataSource={invoices} 
              rowKey="_id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`Chốt số điện nước - Phòng ${selectedRecord?.room?.roomNumber}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Lưu & Tạo hóa đơn"
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveInvoice}>
          <div style={{ marginBottom: '16px', textAlign: 'right' }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={async (file) => {
                setOcrLoading(true);
                try {
                  const result = await Tesseract.recognize(file, 'eng', {
                    logger: m => console.log(m)
                  });
                  // Tìm số trong kết quả OCR
                  const numbers = result.data.text.match(/\d+/g);
                  if (numbers && numbers.length > 0) {
                    message.success(`Đã nhận diện: ${numbers[0]}`);
                    // Gợi ý điền vào chỉ số mới (giả sử số lớn nhất là chỉ số mới)
                    const maxNum = Math.max(...numbers.map(Number));
                    form.setFieldsValue({ elecCurrent: maxNum });
                  } else {
                    message.warning('Không tìm thấy số trong ảnh');
                  }
                } catch (err) {
                  message.error('Lỗi khi quét ảnh');
                } finally {
                  setOcrLoading(false);
                }
                return false;
              }}
            >
              <Button icon={ocrLoading ? <LoadingOutlined /> : <ScanOutlined />} loading={ocrLoading}>
                {ocrLoading ? 'Đang quét...' : 'Quét chỉ số từ ảnh'}
              </Button>
            </Upload>
          </div>
          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
            <CalculatorOutlined /> Điện (Đơn giá: {selectedRecord?.electricityPrice?.toLocaleString('en-US')} VNĐ/kWh)
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="elecPrevious" label="Chỉ số cũ" rules={[{ required: true }]}>
                <InputNumber 
                  style={{ width: '100%' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="elecCurrent" label="Chỉ số mới" rules={[{ required: true }]}>
                <InputNumber 
                  style={{ width: '100%' }} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginTop: '16px' }}>
            <SettingOutlined /> Nước (Đơn giá: {selectedRecord?.waterPrice?.toLocaleString('en-US')} VNĐ/{selectedRecord?.waterType === 'per_m3' ? 'm3' : 'người'})
          </Title>
          {selectedRecord?.waterType === 'per_m3' ? (
            <Row gutter={16}>
              <Col span={12}>
                 <Form.Item name="waterPrevious" label="Chỉ số cũ" rules={[{ required: true }]}>
                  <InputNumber 
                    style={{ width: '100%' }} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                 <Form.Item name="waterCurrent" label="Chỉ số mới" rules={[{ required: true }]}>
                  <InputNumber 
                    style={{ width: '100%' }} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : (
             <Form.Item name="waterUsage" label="Số người" rules={[{ required: true }]}>
              <InputNumber 
                style={{ width: '100%' }} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          )}

          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginTop: '16px' }}>
            <SettingOutlined /> Dịch vụ đang sử dụng
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hasWifi" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox onChange={() => forceUpdate({})}>
                  Wifi ({selectedRecord?.wifiPrice?.toLocaleString('en-US')} VNĐ)
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hasTrash" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox onChange={() => forceUpdate({})}>
                  Rác ({selectedRecord?.trashPrice?.toLocaleString('en-US')} VNĐ)
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hasOtherService" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox onChange={() => forceUpdate({})}>
                  Khác ({selectedRecord?.otherServicePrice?.toLocaleString('en-US')} VNĐ)
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginTop: '16px' }}>
            <DollarOutlined /> Phụ thu khác (Phạt, cọc, đền bù...)
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="extraFee" label="Số tiền phụ thu">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={() => forceUpdate({})}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="extraNote" label="Ghi chú phụ thu">
                <Input placeholder="Ví dụ: Phạt thanh toán muộn, đền bù mất khóa..." />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginTop: '16px' }}>
            <ToolOutlined /> Phí bảo trì cộng dồn (Khách thuê chịu)
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="maintenanceFee" label="Số tiền bảo trì">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="maintenanceNote" label="Chi tiết bảo trì">
                <Input disabled placeholder="Không có phí bảo trì tích lũy" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
            <Row justify="space-between" style={{ marginBottom: '8px' }}>
              <Text>Tiền phòng:</Text>
              <Text strong>{selectedRecord?.rentPrice?.toLocaleString('en-US')} VNĐ</Text>
            </Row>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const isWifi = getFieldValue('hasWifi');
                const isTrash = getFieldValue('hasTrash');
                const isOther = getFieldValue('hasOtherService');
                
                const currentServicePrice = 
                  (isWifi ? (selectedRecord?.wifiPrice || 0) : 0) + 
                  (isTrash ? (selectedRecord?.trashPrice || 0) : 0) + 
                  (isOther ? (selectedRecord?.otherServicePrice || 0) : 0);
                const extra = getFieldValue('extraFee') || 0;
                const maint = getFieldValue('maintenanceFee') || 0;
                const totalPreview = (selectedRecord?.rentPrice || 0) + currentServicePrice + extra + maint;
                return (
                  <>
                    {currentServicePrice > 0 && (
                      <Row justify="space-between" style={{ marginBottom: '8px' }}>
                        <Text>Tiền dịch vụ:</Text>
                        <Text strong>{currentServicePrice.toLocaleString('en-US')} VNĐ</Text>
                      </Row>
                    )}
                    {extra > 0 && (
                      <Row justify="space-between" style={{ marginBottom: '8px', borderTop: '1px dashed #d9d9d9', paddingTop: '8px' }}>
                        <Text>Phụ thu khác:</Text>
                        <Text strong>{extra.toLocaleString('en-US')} VNĐ</Text>
                      </Row>
                    )}
                    {maint > 0 && (
                      <Row justify="space-between" style={{ marginBottom: '8px', borderTop: '1px dashed #d9d9d9', paddingTop: '8px' }}>
                        <Text>Phí bảo trì:</Text>
                        <Text strong>{maint.toLocaleString('en-US')} VNĐ</Text>
                      </Row>
                    )}
                    <Row justify="space-between" style={{ marginTop: '12px' }}>
                      <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
                      <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
                        {(totalPreview).toLocaleString('en-US')} VNĐ
                      </Title>
                    </Row>
                    <Text type="secondary" size="small">* Chưa bao gồm tiền điện nước thực tế sau khi tính toán.</Text>
                  </>
                );
              }}
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết hóa đơn ${selectedInvoice?.invoiceNumber || ''}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={640}
      >
        {selectedInvoice && (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Phòng">{selectedInvoice.room?.roomNumber}</Descriptions.Item>
            <Descriptions.Item label="Khách thuê">{selectedInvoice.tenant?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Tiền phòng">{selectedInvoice.roomPrice?.toLocaleString('en-US')} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Tiền điện">
              {selectedInvoice.electricity?.amount?.toLocaleString('en-US')} VNĐ ({selectedInvoice.electricity?.previous} -&gt; {selectedInvoice.electricity?.current}, {selectedInvoice.electricity?.usage} kWh)
            </Descriptions.Item>
            <Descriptions.Item label="Tiền nước">
              {selectedInvoice.water?.amount?.toLocaleString('en-US')} VNĐ ({selectedInvoice.water?.usage} x {selectedInvoice.water?.price?.toLocaleString('en-US')} VNĐ)
            </Descriptions.Item>
            <Descriptions.Item label="Dịch vụ">{selectedInvoice.servicePrice?.toLocaleString('en-US')} VNĐ</Descriptions.Item>
            {selectedInvoice.extraFee > 0 && (
              <Descriptions.Item label="Phụ thu khác">
                {selectedInvoice.extraFee?.toLocaleString('en-US')} VNĐ 
                {selectedInvoice.extraNote && <Text type="secondary"> ({selectedInvoice.extraNote})</Text>}
              </Descriptions.Item>
            )}
            {selectedInvoice.maintenanceFee > 0 && (
              <Descriptions.Item label="Phí bảo trì/sửa chữa">
                {selectedInvoice.maintenanceFee?.toLocaleString('en-US')} VNĐ 
                {selectedInvoice.maintenanceNote && <Text type="secondary"> ({selectedInvoice.maintenanceNote})</Text>}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tổng cộng">
              <Text strong style={{ color: '#cf1322' }}>{selectedInvoice.totalAmount?.toLocaleString('en-US')} VNĐ</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Hạn thanh toán">{dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedInvoice.status === 'paid' ? 'Đã thanh toán' : selectedInvoice.status === 'overdue' ? 'Quá hạn' : 'Chờ thanh toán'}
            </Descriptions.Item>
            {selectedInvoice.status !== 'paid' && selectedInvoice.qrCode && (
              <Descriptions.Item label="Mã thanh toán QR">
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <img 
                    src={selectedInvoice.qrCode} 
                    alt="VietQR" 
                    style={{ width: '200px', border: '1px solid #f0f0f0', borderRadius: '4px' }} 
                  />
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    Cho khách hàng quét mã này để chuyển khoản
                  </div>
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
