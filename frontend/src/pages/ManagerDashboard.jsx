import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Badge, message, Spin, Tag, Flex } from 'antd';
import {
  EditOutlined, BellOutlined, DollarOutlined, MessageOutlined,
  CheckCircleOutlined, HomeOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const MotionCol = motion.create(Col);
const MotionDiv = motion.div;

/* ─── 2026 Electric Pulse Palette ─── */
const palette = {
  primary: '#635BFF',
  cyan: '#00E5E5',
  rose: '#EF5777',
  mint: '#00FFC2',
  warm: '#F7971E',
  textPrimary: '#1a1a2e',
  textSecondary: '#6e7191',
  surface: 'rgba(255,255,255,0.55)',
  surfaceBorder: 'rgba(255,255,255,0.18)',
};

const glassCard = {
  borderRadius: 20,
  border: `1px solid ${palette.surfaceBorder}`,
  background: palette.surface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const hoverLift = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.2 } },
};

const quickActions = [
  { title: 'Nhập chỉ số', icon: <EditOutlined />, gradient: `linear-gradient(135deg, ${palette.primary}, #8B5CF6)`, path: '/invoices' },
  { title: 'Gửi thông báo', icon: <BellOutlined />, gradient: `linear-gradient(135deg, ${palette.rose}, #FF6B6B)`, path: '/notifications' },
  { title: 'Nhắc nợ', icon: <DollarOutlined />, gradient: 'linear-gradient(135deg, #F7971E, #FFD200)', path: '/payments' },
  { title: 'Nhắn tin', icon: <MessageOutlined />, gradient: `linear-gradient(135deg, ${palette.cyan}, ${palette.mint})`, path: '/chat' },
];

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagerStats = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/dashboard/manager', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(response.data.data);
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu Manager Dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchManagerStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Spin size="large" />
    </div>
  );

  const missingCount = stats?.missingReadings?.length || 0;
  const overdueCount = stats?.overdueInvoices?.length || 0;

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 32px)',
      maxWidth: 1200, margin: '0 auto',
      background: 'linear-gradient(180deg, #F8F7FF 0%, #F0F4FF 50%, #F8FFFE 100%)',
      minHeight: '100vh',
    }}>
      {/* ─── Header ─── */}
      <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 'clamp(20px, 3vw, 28px)' }}>
          <div>
            <Flex align="center" gap={10}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.cyan})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18,
              }}>
                <ThunderboltOutlined />
              </div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: palette.textPrimary, fontSize: 'clamp(20px, 4vw, 28px)' }}>
                Vận hành hôm nay
              </Title>
            </Flex>
            <Text style={{ color: palette.textSecondary, fontSize: 14, display: 'block', marginTop: 4 }}>
              Tháng {stats?.currentMonth}/{stats?.currentYear}
            </Text>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="primary" size="large" icon={<HomeOutlined />}
              onClick={() => navigate('/rooms')}
              style={{
                borderRadius: 14, fontWeight: 700,
                background: `linear-gradient(135deg, ${palette.primary}, #8B5CF6)`,
                border: 'none', boxShadow: `0 6px 20px ${palette.primary}40`,
                height: 44,
              }}
            >
              Sơ đồ phòng
            </Button>
          </motion.div>
        </Flex>
      </MotionDiv>

      {/* ─── Quick Actions ─── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {quickActions.map((action, i) => (
          <MotionCol xs={12} sm={6} key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 20 }}>
              <Card
                style={{ ...glassCard, cursor: 'pointer', textAlign: 'center' }}
                styles={{ body: { padding: 'clamp(14px, 3vw, 20px)' } }}
                onClick={() => navigate(action.path)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14, margin: '0 auto 10px',
                  background: action.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                }}>
                  {action.icon}
                </div>
                <Text strong style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: palette.textPrimary }}>
                  {action.title}
                </Text>
              </Card>
            </motion.div>
          </MotionCol>
        ))}
      </Row>

      {/* ─── Task Cards ─── */}
      <Row gutter={[16, 16]}>
        {/* Missing Readings */}
        <MotionCol xs={24} lg={12} custom={4} initial="hidden" animate="visible" variants={fadeUp}>
          <Card
            style={glassCard}
            styles={{ body: { padding: 'clamp(16px, 3vw, 24px)' } }}
          >
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
              <Flex align="center" gap={8}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `linear-gradient(135deg, ${palette.warm}, #FFD200)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14,
                }}>
                  <EditOutlined />
                </div>
                <Text strong style={{ fontSize: 14, color: palette.textPrimary }}>Cần nhập chỉ số</Text>
                {missingCount > 0 && (
                  <Tag style={{
                    background: `linear-gradient(135deg, ${palette.warm}, #FFD200)`,
                    color: '#fff', fontWeight: 700, borderRadius: 12, border: 'none', fontSize: 12,
                  }}>
                    {missingCount}
                  </Tag>
                )}
              </Flex>
              <Button type="link" onClick={() => navigate('/invoices')} style={{ fontWeight: 600, color: palette.primary }}>
                Nhập ngay →
              </Button>
            </Flex>
            {missingCount === 0 ? (
              <Flex align="center" gap={8} style={{ padding: 12 }}>
                <CheckCircleOutlined style={{ color: palette.mint, fontSize: 20 }} />
                <Text style={{ color: palette.textSecondary }}>Đã hoàn thành nhập chỉ số tháng này!</Text>
              </Flex>
            ) : (
              <Flex wrap="wrap" gap={8}>
                {stats.missingReadings.map((item) => (
                  <Tag key={item._id} style={{
                    borderRadius: 10, padding: '4px 12px', fontWeight: 500,
                    background: 'rgba(247,151,30,0.1)', color: palette.warm, border: `1px solid rgba(247,151,30,0.2)`,
                  }}>
                    Phòng {item.roomNumber}
                  </Tag>
                ))}
              </Flex>
            )}
          </Card>
        </MotionCol>

        {/* Overdue Invoices */}
        <MotionCol xs={24} lg={12} custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <Card
            style={glassCard}
            styles={{ body: { padding: 'clamp(16px, 3vw, 24px)' } }}
          >
            <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `linear-gradient(135deg, ${palette.rose}, #FF6B6B)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14,
              }}>
                <BellOutlined />
              </div>
              <Text strong style={{ fontSize: 14, color: palette.textPrimary }}>Hóa đơn chờ thu</Text>
              {overdueCount > 0 && (
                <Tag style={{
                  background: `linear-gradient(135deg, ${palette.rose}, #FF6B6B)`,
                  color: '#fff', fontWeight: 700, borderRadius: 12, border: 'none', fontSize: 12,
                }}>
                  {overdueCount}
                </Tag>
              )}
            </Flex>
            {overdueCount === 0 ? (
              <Flex align="center" gap={8} style={{ padding: 12 }}>
                <CheckCircleOutlined style={{ color: palette.mint, fontSize: 20 }} />
                <Text style={{ color: palette.textSecondary }}>Không có hóa đơn chờ thu</Text>
              </Flex>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.overdueInvoices.slice(0, 5).map((item) => (
                  <Flex key={item._id} align="center" justify="space-between"
                    style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(239,87,119,0.06)',
                      border: '1px solid rgba(239,87,119,0.1)',
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 13 }}>Phòng {item.room?.roomNumber}</Text>
                      <Text style={{ color: palette.textSecondary, fontSize: 12, display: 'block' }}>
                        {item.tenant?.fullName} — {item.totalAmount?.toLocaleString('vi-VN')}đ
                      </Text>
                    </div>
                    <Button size="small" type="primary" ghost icon={<BellOutlined />}
                      style={{ borderRadius: 10, borderColor: palette.rose, color: palette.rose }}
                    >
                      Nhắc
                    </Button>
                  </Flex>
                ))}
              </div>
            )}
          </Card>
        </MotionCol>
      </Row>

      {/* ─── Bottom Stats ─── */}
      <Row gutter={[12, 12]} style={{ marginTop: 20 }}>
        {[
          { title: 'Phòng trống', value: stats?.availableRoomsCount || 0, icon: <HomeOutlined />, gradient: `linear-gradient(135deg, ${palette.cyan}, ${palette.mint})` },
          { title: 'Yêu cầu sửa chữa', value: 0, icon: <CheckCircleOutlined />, gradient: `linear-gradient(135deg, ${palette.primary}, #8B5CF6)` },
          { title: 'Tin nhắn mới', value: 0, icon: <MessageOutlined />, gradient: `linear-gradient(135deg, ${palette.warm}, #FFD200)` },
        ].map((item, i) => (
          <MotionCol xs={8} key={i} custom={6 + i} initial="hidden" animate="visible" variants={fadeUp}>
            <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 20 }}>
              <Card style={{ ...glassCard, textAlign: 'center' }} styles={{ body: { padding: 'clamp(12px, 2.5vw, 20px)' } }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, margin: '0 auto 8px',
                  background: item.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16,
                }}>
                  {item.icon}
                </div>
                <Text strong style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: palette.textPrimary, display: 'block' }}>
                  {item.value}
                </Text>
                <Text style={{ color: palette.textSecondary, fontSize: 'clamp(10px, 2vw, 12px)' }}>
                  {item.title}
                </Text>
              </Card>
            </motion.div>
          </MotionCol>
        ))}
      </Row>
    </div>
  );
};

export default ManagerDashboard;
