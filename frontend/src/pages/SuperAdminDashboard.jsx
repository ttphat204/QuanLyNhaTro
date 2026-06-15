import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, message, Spin, Table, Tag, Flex } from 'antd';
import {
  GlobalOutlined, TeamOutlined, SafetyOutlined,
  BarChartOutlined, RocketOutlined, UserOutlined,
  HomeOutlined, FileProtectOutlined, CrownOutlined
} from '@ant-design/icons';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const MotionCol = motion.create(Col);
const MotionDiv = motion.div;

/* ─── 2026 Carbon Mint Palette ─── */
const palette = {
  primary: '#635BFF',
  cyan: '#00E5E5',
  mint: '#00FFC2',
  rose: '#EF5777',
  violet: '#5758BB',
  dark: '#2D3436',
  surface: 'rgba(255,255,255,0.55)',
  surfaceBorder: 'rgba(255,255,255,0.18)',
  textPrimary: '#1a1a2e',
  textSecondary: '#6e7191',
};

const glassCard = {
  borderRadius: 20,
  border: `1px solid ${palette.surfaceBorder}`,
  background: palette.surface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
};

const statCards = [
  { title: 'Landlords', key: 'totalLandlords', icon: <TeamOutlined />, gradient: `linear-gradient(135deg, ${palette.primary}, #8B5CF6)` },
  { title: 'Managers', key: 'totalManagers', icon: <SafetyOutlined />, gradient: `linear-gradient(135deg, ${palette.cyan}, ${palette.mint})` },
  { title: 'Tenants', key: 'totalTenants', icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #F7971E, #FFD200)' },
  { title: 'Tổng phòng', key: 'totalRooms', icon: <HomeOutlined />, gradient: `linear-gradient(135deg, ${palette.rose}, #FF6B6B)` },
  { title: 'HĐ active', key: 'totalContracts', icon: <FileProtectOutlined />, gradient: `linear-gradient(135deg, ${palette.violet}, ${palette.primary})` },
  { title: 'Doanh thu SaaS', key: 'totalRevenue', icon: <BarChartOutlined />, gradient: `linear-gradient(135deg, ${palette.mint}, ${palette.cyan})`, isCurrency: true },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const hoverLift = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.2 } },
};

const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
      padding: '14px 18px', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.3)',
    }}>
      <Text strong style={{ display: 'block', marginBottom: 6, color: palette.textPrimary }}>{label}</Text>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
            {p.name}: <strong style={{ color: palette.textPrimary }}>{p.value.toLocaleString('vi-VN')}</strong>
          </Text>
        </div>
      ))}
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5005/api/dashboard/superadmin');
        setData(res.data.data);
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu Super Admin');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 32px)',
      maxWidth: 1440, margin: '0 auto',
      background: 'linear-gradient(180deg, #F0F0FF 0%, #F8F7FF 50%, #EDFFFE 100%)',
      minHeight: '100vh',
    }}>
      {/* ─── Header ─── */}
      <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
          <div>
            <Flex align="center" gap={10}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.cyan})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 20, boxShadow: `0 6px 20px ${palette.primary}40`,
              }}>
                <CrownOutlined />
              </div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: palette.textPrimary }}>
                Hệ thống SaaS
              </Title>
            </Flex>
            <Text style={{ color: palette.textSecondary, fontSize: 14, marginTop: 4, display: 'block' }}>
              Quản trị toàn bộ nền tảng Quản Lý Nhà Trọ
            </Text>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Tag style={{
              background: `linear-gradient(135deg, ${palette.mint}, ${palette.cyan})`,
              color: palette.dark, fontWeight: 700, fontSize: 13,
              padding: '5px 16px', borderRadius: 20, border: 'none',
            }}>
              ● Platform Stable
            </Tag>
          </motion.div>
        </Flex>
      </MotionDiv>

      {/* ─── Stat Cards ─── */}
      <Row gutter={[12, 12]}>
        {statCards.map((card, i) => (
          <MotionCol xs={12} sm={8} md={4} key={card.key} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 20 }}>
              <Card style={{ ...glassCard, overflow: 'hidden', position: 'relative', cursor: 'pointer' }} styles={{ body: { padding: 'clamp(14px, 2vw, 20px)' } }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 64, height: 64, borderRadius: '50%',
                  background: card.gradient, opacity: 0.15, filter: 'blur(4px)',
                }} />
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: card.gradient, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, marginBottom: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  {card.icon}
                </div>
                <Text style={{ color: palette.textSecondary, fontSize: 'clamp(10px, 1.1vw, 12px)', fontWeight: 500 }}>{card.title}</Text>
                <div style={{ marginTop: 2 }}>
                  <Text strong style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', color: palette.textPrimary, lineHeight: 1.1 }}>
                    {card.isCurrency ? `${(data?.[card.key] || 0).toLocaleString('vi-VN')}đ` : data?.[card.key] || 0}
                  </Text>
                </div>
              </Card>
            </motion.div>
          </MotionCol>
        ))}
      </Row>

      {/* ─── Growth Chart + Recent Landlords ─── */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <MotionCol xs={24} lg={14} custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <Card style={glassCard} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
            <Text style={{ color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Tăng trưởng người dùng
            </Text>
            <div style={{ width: '100%', height: 'clamp(240px, 32vw, 320px)', marginTop: 16 }}>
              <ResponsiveContainer>
                <AreaChart data={data?.growthData}>
                  <defs>
                    <linearGradient id="gLandlords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.primary} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={palette.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gTenants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.cyan} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={palette.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="landlords" name="Landlords" stroke={palette.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#gLandlords)" dot={{ fill: palette.primary, r: 4, strokeWidth: 2, stroke: '#fff' }} />
                  <Area type="monotone" dataKey="tenants" name="Tenants" stroke={palette.cyan} strokeWidth={2.5} fillOpacity={1} fill="url(#gTenants)" dot={{ fill: palette.cyan, r: 4, strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </MotionCol>

        <MotionCol xs={24} lg={10} custom={7} initial="hidden" animate="visible" variants={fadeUp}>
          <Card style={glassCard} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
            <Flex align="center" gap={8} style={{ marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `linear-gradient(135deg, ${palette.primary}, #8B5CF6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13,
              }}>
                <RocketOutlined />
              </div>
              <Text style={{ color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                Landlord mới đăng ký
              </Text>
            </Flex>
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={data?.recentLandlords || []}
                rowKey="_id"
                pagination={false}
                size="small"
                scroll={{ x: 400 }}
                columns={[
                  {
                    title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', width: 140,
                    render: (t) => <Text strong style={{ fontSize: 13 }}>{t}</Text>,
                  },
                  {
                    title: 'Email', dataIndex: 'email', key: 'email', width: 180,
                    render: (t) => <Text style={{ color: palette.textSecondary, fontSize: 12 }}>{t}</Text>,
                  },
                  {
                    title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 100,
                    render: (v) => <Tag style={{ borderRadius: 8, fontSize: 11 }}>{dayjs(v).format('DD/MM/YY')}</Tag>,
                  },
                ]}
              />
            </div>
          </Card>
        </MotionCol>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard;
