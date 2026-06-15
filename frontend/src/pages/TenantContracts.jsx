import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col, 
  Descriptions,
  Tag,
  Spin,
  message,
  Empty
} from 'antd';
import { 
  FileProtectOutlined, 
  DownloadOutlined, 
  CalendarOutlined,
  HomeOutlined,
  DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TenantContracts = () => {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    fetchMyContracts();
  }, []);

  const fetchMyContracts = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/contracts/my-contracts');
      setContracts(response.data.data);
    } catch (error) {
      message.error('Không thể tải thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;

  if (contracts.length === 0) return <Empty description="Bạn chưa có hợp đồng nào" style={{ marginTop: 50 }} />;

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card variant="borderless" style={{ borderRadius: '12px' }}>
            <Space size="middle">
              <div style={{ backgroundColor: '#e6f7ff', padding: '12px', borderRadius: '8px' }}>
                <FileProtectOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>Hợp đồng của tôi</Title>
                <Text type="secondary">Xem chi tiết các điều khoản và thời hạn hợp đồng thuê phòng</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {contracts.map(contract => (
        <Card 
          key={contract._id} 
          style={{ marginBottom: '24px', borderRadius: '12px' }}
          title={
            <Space>
              <Text strong>Hợp đồng #{contract.contractNumber}</Text>
              <Tag color={contract.status === 'active' ? 'green' : 'red'}>
                {contract.status === 'active' ? 'Đang hiệu lực' : 'Đã kết thúc'}
              </Tag>
            </Space>
          }
          extra={
            contract.contractFile && (
              <Button type="primary" icon={<DownloadOutlined />} href={contract.contractFile} target="_blank">
                Tải bản scan
              </Button>
            )
          }
        >
          <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
            <Descriptions.Item label={<span><HomeOutlined /> Phòng</span>}>
              Phòng {contract.room?.roomNumber} ({contract.room?.type})
            </Descriptions.Item>
            <Descriptions.Item label={<span><CalendarOutlined /> Thời hạn</span>}>
              {dayjs(contract.startDate).format('DD/MM/YYYY')} - {dayjs(contract.endDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label={<span><DollarOutlined /> Tiền cọc</span>}>
              <Text strong style={{ color: '#fa8c16' }}>{contract.deposit?.toLocaleString('en-US')} VNĐ</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giá thuê thực tế">
              <Text strong>{contract.rentPrice?.toLocaleString('en-US')} VNĐ / tháng</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giá điện">
              {contract.electricityPrice?.toLocaleString('en-US')} VNĐ/kWh
            </Descriptions.Item>
            <Descriptions.Item label="Giá nước">
              {contract.waterPrice?.toLocaleString('en-US')} VNĐ/{contract.waterType === 'per_m3' ? 'm3' : 'người'}
            </Descriptions.Item>
            <Descriptions.Item label="Phí dịch vụ">
              {contract.servicePrice?.toLocaleString('en-US')} VNĐ/tháng
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {contract.note || 'Không có ghi chú'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ))}
    </div>
  );
};

export default TenantContracts;
