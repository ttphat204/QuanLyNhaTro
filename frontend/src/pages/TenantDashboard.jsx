import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, message, Spin, Tag, Button, Flex } from 'antd';
import {
  CreditCardOutlined, MessageOutlined, ClockCircleOutlined,
  FileTextOutlined, ArrowRightOutlined, SmileOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const MotionCol = motion.create(Col);
const MotionDiv = motion.div;

/* ─── 2026 Cyber Rose Palette ─── */
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const hoverLift = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.2 } },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Chào buổi sáng', emoji: '🌤️', bg: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)' };
  if (h < 18) return { text: 'Chào buổi chiều', emoji: '☀️', bg: `linear-gradient(135deg, ${palette.warm} 0%, #FF6B6B 100%)` };
  return { text: 'Chào buổi tối', emoji: '🌙', bg: `linear-gradient(135deg, ${palette.primary} 0%, #8B5CF6 100%)` };
};

const TenantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const greeting = getGreeting();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/dashboard/tenant');
        setData(res.data.data);
      } catch (error) {
        message.error('Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Spin size="large" />
    </div>
  );

  const latestInv = data?.latestInvoice;
  const hasDebt = (data?.totalDebt || 0) > 0;

  return (
    <div style={{
      padding: 'clamp(16px, 5vw, 28px)',
      maxWidth: 720, margin: '0 auto',
      background: 'linear-gradient(180deg, #FFF8F5 0%, #F8F7FF 50%, #F0FFFE 100%)',
      minHeight: '100vh',
    }}>
      {/* ─── Greeting ─── */}
      <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 'clamp(20px, 4vw, 28px)' }}>
          <Flex align="center" gap={10}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: greeting.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            }}>
              {greeting.emoji}
            </div>
            <div>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: palette.textPrimary, fontSize: 'clamp(20px, 5vw, 26px)' }}>
                {greeting.text}!
              </Title>
              <Text style={{ color: palette.textSecondary, fontSize: 'clamp(13px, 3vw, 15px)' }}>
                {user?.fullName || 'Khách thuê'}
              </Text>
            </div>
          </Flex>
        </div>
      </MotionDiv>

      {/* ─── Urgent Payment Banner ─── */}
      {latestInv && latestInv.status !== 'paid' && (
        <MotionDiv custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Card
            style={{
              borderRadius: 24, border: 'none',
              background: `linear-gradient(135deg, ${palette.rose} 0%, #FF6B6B 60%, #FF8E53 100%)`,
              marginBottom: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer',
            }}
            styles={{ body: { padding: 'clamp(20px, 5vw, 28px)' } }}
            onClick={() => navigate('/my-invoices')}
          >
            {/* Decorative orbs */}
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
            }} />
            <div style={{
              position: 'absolute', bottom: -24, left: -24,
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} />
            <Flex align="center" justify="space-between" wrap="wrap" gap={16}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(10px, 2.5vw, 12px)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                  Cần thanh toán
                </Text>
                <Title level={3} style={{ color: '#fff', margin: '4px 0 0', fontWeight: 800, fontSize: 'clamp(22px, 6vw, 30px)' }}>
                  {latestInv.totalAmount?.toLocaleString('vi-VN')}đ
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 3vw, 14px)' }}>
                  Hạn: {dayjs(latestInv.dueDate).format('DD/MM/YYYY')}
                </Text>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="default" size="large" icon={<ArrowRightOutlined />}
                  style={{
                    borderRadius: 16, fontWeight: 700,
                    height: 'clamp(44px, 10vw, 52px)', paddingInline: 'clamp(16px, 4vw, 24px)',
                    background: '#fff', color: palette.rose, border: 'none',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)', fontSize: 'clamp(13px, 3vw, 15px)',
                  }}
                >
                  Thanh toán
                </Button>
              </motion.div>
            </Flex>
          </Card>
        </MotionDiv>
      )}

      {/* ─── Stat Cards ─── */}
      <Row gutter={[14, 14]}>
        {/* Latest Invoice */}
        <MotionCol xs={24} sm={12} custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 22 }}>
            <Card
              style={{ ...glassCard, cursor: 'pointer' }}
              styles={{ body: { padding: 'clamp(18px, 4vw, 24px)' } }}
              onClick={() => navigate('/my-invoices')}
            >
              <Flex align="center" gap={10} style={{ marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `linear-gradient(135deg, ${palette.primary}, #8B5CF6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20, boxShadow: `0 4px 14px ${palette.primary}40`,
                }}>
                  <CreditCardOutlined />
                </div>
                <Text style={{ color: palette.textSecondary, fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 500 }}>
                  Hóa đơn mới nhất
                </Text>
              </Flex>
              {latestInv ? (
                <>
                  <Text strong style={{ fontSize: 'clamp(24px, 6vw, 30px)', color: palette.textPrimary, lineHeight: 1.1 }}>
                    {latestInv.totalAmount?.toLocaleString('vi-VN')}đ
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                      T{latestInv.month}/{latestInv.year}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      {latestInv.status === 'paid'
                        ? <Tag color="success" style={{ borderRadius: 10, fontWeight: 600 }}>✓ Đã thanh toán</Tag>
                        : <Tag color="warning" style={{ borderRadius: 10, fontWeight: 600 }}>● Chờ thanh toán</Tag>}
                    </div>
                  </div>
                </>
              ) : (
                <Flex align="center" gap={6}>
                  <SmileOutlined style={{ color: palette.mint, fontSize: 20 }} />
                  <Text style={{ color: palette.textSecondary }}>Chưa có hóa đơn</Text>
                </Flex>
              )}
            </Card>
          </motion.div>
        </MotionCol>

        {/* Debt */}
        <MotionCol xs={24} sm={12} custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 22 }}>
            <Card style={glassCard} styles={{ body: { padding: 'clamp(18px, 4vw, 24px)' } }}>
              <Flex align="center" gap={10} style={{ marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: hasDebt
                    ? `linear-gradient(135deg, ${palette.rose}, #FF6B6B)`
                    : `linear-gradient(135deg, ${palette.cyan}, ${palette.mint})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20,
                  boxShadow: hasDebt ? '0 4px 14px rgba(239,87,119,0.3)' : '0 4px 14px rgba(0,229,229,0.3)',
                }}>
                  <ClockCircleOutlined />
                </div>
                <Text style={{ color: palette.textSecondary, fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 500 }}>
                  Tổng nợ hiện tại
                </Text>
              </Flex>
              <Text strong style={{
                fontSize: 'clamp(24px, 6vw, 30px)',
                color: hasDebt ? palette.rose : palette.cyan,
                lineHeight: 1.1,
              }}>
                {(data?.totalDebt || 0).toLocaleString('vi-VN')}đ
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                  Từ {data?.unpaidCount || 0} hóa đơn chưa trả
                </Text>
              </div>
            </Card>
          </motion.div>
        </MotionCol>
      </Row>

      {/* ─── Quick Actions ─── */}
      <Row gutter={[14, 14]} style={{ marginTop: 14 }}>
        <MotionCol xs={12} custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 22 }}>
            <Card
              style={{ ...glassCard, cursor: 'pointer', textAlign: 'center' }}
              styles={{ body: { padding: 'clamp(20px, 5vw, 28px)' } }}
              onClick={() => navigate('/my-invoices')}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 12px',
                background: 'linear-gradient(135deg, #F7971E, #FFD200)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 24, boxShadow: '0 6px 16px rgba(247,151,30,0.3)',
              }}>
                <FileTextOutlined />
              </div>
              <Text strong style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', color: palette.textPrimary }}>
                Xem Hóa đơn
              </Text>
            </Card>
          </motion.div>
        </MotionCol>
        <MotionCol xs={12} custom={4} initial="hidden" animate="visible" variants={fadeUp}>
          <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 22 }}>
            <Card
              style={{ ...glassCard, cursor: 'pointer', textAlign: 'center' }}
              styles={{ body: { padding: 'clamp(20px, 5vw, 28px)' } }}
              onClick={() => navigate('/chat')}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 12px',
                background: `linear-gradient(135deg, ${palette.cyan}, ${palette.primary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 24, boxShadow: `0 6px 16px ${palette.primary}40`,
              }}>
                <MessageOutlined />
              </div>
              <Text strong style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', color: palette.textPrimary }}>
                Nhắn tin
              </Text>
            </Card>
          </motion.div>
        </MotionCol>
      </Row>
    </div>
  );
};

export default TenantDashboard;
