import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, message, Spin, Table, Tag, Flex } from 'antd';
import {
  HomeOutlined, UserOutlined, DollarOutlined, ExceptionOutlined,
  InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
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
  dark: '#0F0E17',
  surface: 'rgba(255,255,255,0.55)',
  surfaceBorder: 'rgba(255,255,255,0.18)',
  textPrimary: '#1a1a2e',
  textSecondary: '#6e7191',
};

/* ─── Liquid Glass Card ─── */
const glassCard = {
  borderRadius: 20,
  border: `1px solid ${palette.surfaceBorder}`,
  background: palette.surface,
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
};

const statCards = [
  {
    title: 'Tổng số phòng', key: 'totalRooms', icon: <HomeOutlined />,
    gradient: `linear-gradient(135deg, ${palette.primary} 0%, #8B5CF6 100%)`,
  },
  {
    title: 'Phòng đang thuê', key: 'occupiedRooms', icon: <UserOutlined />,
    gradient: `linear-gradient(135deg, ${palette.cyan} 0%, ${palette.mint} 100%)`,
  },
  {
    title: 'Hóa đơn chưa thu', key: 'unpaidCount', icon: <ExceptionOutlined />,
    gradient: `linear-gradient(135deg, ${palette.rose} 0%, #FF6B6B 100%)`,
  },
  {
    title: 'Doanh thu tháng', key: 'revenue', icon: <DollarOutlined />,
    gradient: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)',
    isCurrency: true,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const hoverLift = {
  rest: { scale: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' },
  hover: { scale: 1.03, boxShadow: '0 16px 48px rgba(99,91,255,0.15)' },
};

/* ─── Custom Tooltip ─── */
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(12px)',
      padding: '14px 18px', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.3)',
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

const LandlordDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [auditData, setAuditData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, auditRes] = await Promise.all([
          axios.get('http://localhost:5005/api/dashboard/admin'),
          axios.get('http://localhost:5005/api/dashboard/audit')
        ]);
        setData(statsRes.data.data);
        setAuditData(auditRes.data.data);
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu thống kê');
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

  const occupancyRate = data?.totalRooms ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0;

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 32px)',
      maxWidth: 1440,
      margin: '0 auto',
      background: 'linear-gradient(180deg, #F8F7FF 0%, #F0F4FF 50%, #F8FFFE 100%)',
      minHeight: '100vh',
    }}>
      {/* ─── Header ─── */}
      <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Flex
          justify="space-between" align="center" wrap="wrap" gap={12}
          style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}
        >
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
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: palette.textPrimary }}>Dashboard</Title>
            </Flex>
            <Text style={{ color: palette.textSecondary, fontSize: 14, marginTop: 4, display: 'block' }}>
              Tổng quan hệ thống — Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </Text>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Tag style={{
              background: occupancyRate > 80
                ? `linear-gradient(135deg, ${palette.mint}, ${palette.cyan})`
                : occupancyRate > 50 ? 'linear-gradient(135deg, #F7971E, #FFD200)' : `linear-gradient(135deg, ${palette.rose}, #FF6B6B)`,
              color: '#fff', fontWeight: 700, fontSize: 14,
              padding: '6px 18px', borderRadius: 24, border: 'none',
            }}>
              Lấp đầy {occupancyRate}%
            </Tag>
          </motion.div>
        </Flex>
      </MotionDiv>

      {/* ─── Stat Cards (Bento Grid) ─── */}
      <Row gutter={[16, 16]}>
        {statCards.map((card, i) => (
          <MotionCol xs={12} sm={12} md={6} key={card.key} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <motion.div variants={hoverLift} initial="rest" whileHover="hover" style={{ borderRadius: 20 }}>
              <Card style={{ ...glassCard, overflow: 'hidden', position: 'relative', cursor: 'pointer' }} styles={{ body: { padding: 'clamp(16px, 2vw, 24px)' } }}>
                {/* Decorative orb */}
                <div style={{
                  position: 'absolute', top: -24, right: -24,
                  width: 80, height: 80, borderRadius: '50%',
                  background: card.gradient, opacity: 0.15, filter: 'blur(4px)',
                }} />
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: card.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 22, marginBottom: 14,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                }}>
                  {card.icon}
                </div>
                <Text style={{ color: palette.textSecondary, fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 500 }}>
                  {card.title}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: palette.textPrimary, lineHeight: 1.1 }}>
                    {card.isCurrency
                      ? `${(data?.[card.key] || 0).toLocaleString('vi-VN')}đ`
                      : data?.[card.key] || 0}
                  </Text>
                </div>
              </Card>
            </motion.div>
          </MotionCol>
        ))}
      </Row>

      {/* ─── Auditing Bento ─── */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <MotionCol xs={24} md={12} custom={4} initial="hidden" animate="visible" variants={fadeUp}>
          <Card style={glassCard} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
            <Text style={{ color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Hiệu suất giá thuê
            </Text>
            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col span={12}>
                <Text style={{ color: palette.textSecondary, fontSize: 12 }}>Niêm yết</Text>
                <div>
                  <Text strong style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: palette.textPrimary }}>
                    {(data?.potentialRevenue || 0).toLocaleString('vi-VN')}đ
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <Text style={{ color: palette.textSecondary, fontSize: 12 }}>Chênh lệch</Text>
                <Flex align="center" gap={4}>
                  <Text strong style={{
                    fontSize: 'clamp(18px, 2.5vw, 24px)',
                    color: (data?.variance || 0) < 0 ? palette.rose : palette.cyan,
                  }}>
                    {(data?.variance || 0) < 0 ? '' : '+'}
                    {(data?.variance || 0).toLocaleString('vi-VN')}đ
                  </Text>
                  {(data?.variance || 0) >= 0
                    ? <ArrowUpOutlined style={{ color: palette.cyan }} />
                    : <ArrowDownOutlined style={{ color: palette.rose }} />}
                </Flex>
              </Col>
            </Row>
          </Card>
        </MotionCol>
        <MotionCol xs={24} md={12} custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <Card style={glassCard} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
            <Text style={{ color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Chênh lệch theo chi nhánh
            </Text>
            <div style={{ marginTop: 14 }}>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={auditData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: palette.textSecondary }} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="drift" name="Chênh lệch" fill={palette.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </MotionCol>
      </Row>

      {/* ─── Charts ─── */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <MotionCol xs={24} lg={12} custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <Card style={glassCard} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
            <Text style={{ color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Doanh thu 6 tháng
            </Text>
            <div style={{ width: '100%', height: 'clamp(220px, 30vw, 300px)', marginTop: 16 }}>
              <ResponsiveContainer>
                <AreaChart data={data?.chartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.primary} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={palette.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke={palette.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" dot={{ fill: palette.primary, r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </MotionCol>
        <MotionCol xs={24} lg={12} custom={7} initial="hidden" animate="visible" variants={fadeUp}>
          <Card style={glassCard} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
            <Text style={{ color: palette.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Tiêu thụ Điện & Nước
            </Text>
            <div style={{ width: '100%', height: 'clamp(220px, 30vw, 300px)', marginTop: 16 }}>
              <ResponsiveContainer>
                <BarChart data={data?.usageData} barGap={6}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: palette.textSecondary }} axisLine={false} tickLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="electricity" name="Điện (kWh)" fill={palette.rose} radius={[8, 8, 0, 0]} barSize={20} />
                  <Bar yAxisId="right" dataKey="water" name="Nước (m³)" fill={palette.primary} radius={[8, 8, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </MotionCol>
      </Row>

      {/* ─── Audit Log Table ─── */}
      <MotionDiv custom={8} initial="hidden" animate="visible" variants={fadeUp}>
        <Card style={{ ...glassCard, marginTop: 20 }} styles={{ body: { padding: 'clamp(16px, 2.5vw, 28px)' } }}>
          <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #F7971E, #FFD200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>
              <InfoCircleOutlined />
            </div>
            <Text strong style={{ fontSize: 14, color: palette.textPrimary }}>Điều chỉnh giá (Audit Log)</Text>
          </Flex>
          <div style={{ overflowX: 'auto' }}>
            <Table
              dataSource={auditData.flatMap(b => b.contracts.map(c => ({ ...c, branchName: b.name })))}
              rowKey="contractNumber"
              pagination={{ pageSize: 5, size: 'small' }}
              size="small"
              scroll={{ x: 600 }}
              columns={[
                {
                  title: 'Chi nhánh', dataIndex: 'branchName', key: 'branchName', width: 120,
                  render: (t) => <Tag color="geekblue" style={{ borderRadius: 8 }}>{t}</Tag>,
                },
                {
                  title: 'Phòng', dataIndex: 'roomNumber', key: 'roomNumber', width: 80,
                  render: (t) => <Text strong>{t}</Text>,
                },
                {
                  title: 'Niêm yết', dataIndex: 'basePrice', key: 'basePrice', width: 120,
                  render: (v) => `${v?.toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Thực tế', dataIndex: 'rentPrice', key: 'rentPrice', width: 120,
                  render: (v) => <Text strong style={{ color: palette.primary }}>{v?.toLocaleString('vi-VN')}đ</Text>,
                },
                {
                  title: 'Chênh lệch', dataIndex: 'drift', key: 'drift', width: 120,
                  render: (v) => (
                    <Tag color={v < 0 ? 'volcano' : 'green'} style={{ borderRadius: 8 }}>
                      {v < 0 ? '' : '+'}{v?.toLocaleString('vi-VN')}đ
                    </Tag>
                  ),
                },
                {
                  title: 'Ghi chú', dataIndex: 'note', key: 'note',
                  render: (t) => <Text type="secondary" italic style={{ fontSize: 12 }}>{t || '—'}</Text>,
                },
              ]}
            />
          </div>
        </Card>
      </MotionDiv>
    </div>
  );
};

export default LandlordDashboard;
