import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  DatePicker, 
  Space, 
  Grid, 
  Badge,
  Input,
  message
} from 'antd';
import { 
  SearchOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Payments = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    fetchPayments();
  }, [dateRange]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await axios.get('http://localhost:5005/api/payments', { params });
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" size="small" style={{ fontSize: '11px' }}>{dayjs(date).format('HH:mm')}</Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
    },
    {
      title: 'Hóa đơn',
      dataIndex: ['invoice', 'invoiceNumber'],
      key: 'invoiceNumber',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{text || 'N/A'}</Tag>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Phòng {record.room?.roomNumber || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <Text strong style={{ color: '#52c41a' }}>{val?.toLocaleString('en-US')} VNĐ</Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const labels = { 
          cash: 'Tiền mặt', 
          transfer: 'Chuyển khoản', 
          vietqr: 'VietQR (Tự động)' 
        };
        const colors = {
          cash: 'orange',
          transfer: 'cyan',
          vietqr: 'purple'
        };
        return <Tag color={colors[method] || 'default'}>{labels[method] || method}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const labels = { pending: 'Chờ xử lý', completed: 'Thành công', failed: 'Thất bại' };
        const badgeStatus = status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'warning';
        return <Badge status={badgeStatus} text={labels[status]} />;
      },
    },
    {
      title: 'Ghi chú / Mã GD',
      key: 'note',
      render: (_, record) => (
        <div style={{ maxWidth: '200px' }}>
          <Text ellipsis={{ tooltip: record.transactionId || record.note }}>
            {record.transactionId || record.note || '-'}
          </Text>
        </div>
      ),
    },
  ];

  const filteredPayments = payments.filter(p => 
    p.invoice?.invoiceNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.room?.roomNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.note?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: isMobile ? '0' : '24px' }}>
      <Card variant="borderless" style={{ borderRadius: isMobile ? '0' : '12px' }} styles={{ body: { padding: isMobile ? '12px' : '24px' } }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={16}>
            <Space size="middle">
              <div style={{ backgroundColor: '#f9f0ff', padding: '12px', borderRadius: '8px' }}>
                <HistoryOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>Lịch sử Thanh toán</Title>
                <Text type="secondary">Theo dõi các giao dịch thanh toán và đối soát tự động</Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <RangePicker 
              value={dateRange} 
              onChange={setDateRange}
              style={{ width: '100%', borderRadius: '8px' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} md={12}>
            <Input 
              placeholder="Tìm theo mã hóa đơn, số phòng hoặc mã giao dịch..." 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ borderRadius: '8px' }}
              allowClear
            />
          </Col>
          <Col xs={24} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
             <Space direction={isMobile ? 'vertical' : 'horizontal'} align={isMobile ? 'start' : 'center'}>
               <Text type="secondary">Tổng thu thành công kỳ này:</Text>
               <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                 {filteredPayments
                   .filter(p => p.status === 'completed')
                   .reduce((sum, p) => sum + p.amount, 0)
                   .toLocaleString('en-US')} VNĐ
               </Title>
             </Space>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={filteredPayments} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default Payments;
