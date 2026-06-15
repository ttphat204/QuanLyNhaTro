import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Table, Button, Modal, Form, Input, Select, InputNumber, DatePicker, message, Spin, Space, Popconfirm, Flex } from 'antd';
import { DollarOutlined, PlusOutlined, DeleteOutlined, FileTextOutlined, RiseOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
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

const FinancialReport = () => {
  const [data, setData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState(undefined);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch branches
      const branchRes = await axios.get('http://localhost:5005/api/branches');
      setBranches(branchRes.data.data);

      // Fetch financial summary
      const params = {};
      if (filterBranch) params.branchId = filterBranch;
      const res = await axios.get('http://localhost:5005/api/dashboard/financial', { params });
      setData(res.data.data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải dữ liệu báo cáo tài chính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [filterBranch]);

  const handleAddExpense = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        date: values.date ? values.date.toDate() : new Date()
      };
      await axios.post('http://localhost:5005/api/expenses', payload);
      message.success('Đã thêm khoản chi phí mới');
      setIsExpenseModalOpen(false);
      form.resetFields();
      fetchFinancialData();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Lỗi khi thêm chi phí');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5005/api/expenses/${id}`);
      message.success('Đã xóa khoản chi phí thành công');
      fetchFinancialData();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi xóa chi phí');
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'maintenance': return <Tag color="warning">Bảo trì/Sửa chữa</Tag>;
      case 'utilities': return <Tag color="blue">Điện/Nước chung</Tag>;
      case 'salary': return <Tag color="purple">Lương nhân viên</Tag>;
      case 'tax': return <Tag color="error">Thuế/Phí</Tag>;
      default: return <Tag color="default">Chi phí khác</Tag>;
    }
  };

  const expenseColumns = [
    {
      title: 'Ngày chi',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tên chi phí / Nội dung',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text style={{ fontWeight: '500' }}>{text}</Text>,
    },
    {
      title: 'Chi nhánh',
      dataIndex: ['branchId', 'name'],
      key: 'branch',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => getCategoryLabel(cat),
    },
    {
      title: 'Số tiền chi',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <Text strong style={{ color: palette.rose }}>-{val.toLocaleString('vi-VN')} đ</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa chi phí này?"
          onConfirm={() => handleDeleteExpense(record._id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" danger icon={<DeleteOutlined />} style={{ display: 'flex', alignItems: 'center' }}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 14px', borderRadius: 12, color: '#fff' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].payload.name}</p>
          <p style={{ margin: '4px 0 0', color: palette.mint }}>Doanh thu: {payload[0].value.toLocaleString('vi-VN')} đ</p>
          <p style={{ margin: 0, color: palette.rose }}>Chi phí: {payload[1].value.toLocaleString('vi-VN')} đ</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: palette.cyan }}>Lợi nhuận: {payload[0].payload.profit.toLocaleString('vi-VN')} đ</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 0' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }} wrap="wrap" gap="middle">
        <Space>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${palette.mint} 0%, #00FFC2 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a2e' }}>
            <RiseOutlined style={{ fontSize: 20 }} />
          </div>

          <div>
            <Title level={3} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Báo cáo Tài chính</Title>
            <Text type="secondary">Doanh thu, chi phí và lợi nhuận thực tế</Text>
          </div>
        </Space>

        <Space wrap>
          <Select
            placeholder="Lọc theo chi nhánh"
            style={{ width: 200, borderRadius: 10 }}
            allowClear
            value={filterBranch}
            onChange={(val) => setFilterBranch(val)}
          >
            {branches.map(b => (
              <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsExpenseModalOpen(true)}
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
            Thêm chi phí mới
          </Button>
        </Space>
      </Flex>

      {/* KPI Cards */}
      <Spin spinning={loading}>
        {data && (
          <>
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card style={{ ...glassCard, background: `linear-gradient(135deg, ${palette.mint} 0%, #00E5E5 100%)`, color: '#1a1a2e' }} bodyStyle={{ padding: 24 }}>
                  <Text style={{ color: 'rgba(26,26,46,0.7)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Doanh thu thu về (Tháng này)</Text>
                  <Title level={2} style={{ margin: '8px 0 0', fontFamily: "'Outfit', sans-serif', sans-serif", color: '#1a1a2e' }}>
                    {data.financialData[data.financialData.length - 1]?.revenue.toLocaleString('vi-VN')} đ
                  </Title>
                  <Text style={{ color: 'rgba(26,26,46,0.6)', fontSize: 12 }}><InfoCircleOutlined /> Chỉ tính hóa đơn đã thanh toán</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ ...glassCard, background: `linear-gradient(135deg, ${palette.rose} 0%, #FF6B6B 100%)`, color: '#fff' }} bodyStyle={{ padding: 24 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Tổng chi phí đã chi (Tháng này)</Text>
                  <Title level={2} style={{ margin: '8px 0 0', fontFamily: "'Outfit', sans-serif', sans-serif", color: '#fff' }}>
                    {data.financialData[data.financialData.length - 1]?.expense.toLocaleString('vi-VN')} đ
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}><InfoCircleOutlined /> Gồm bảo trì và các chi phí chung</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ ...glassCard, background: `linear-gradient(135deg, ${palette.primary} 0%, #8B5CF6 100%)`, color: '#fff' }} bodyStyle={{ padding: 24 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Lợi nhuận ròng (Tháng này)</Text>
                  <Title level={2} style={{ margin: '8px 0 0', fontFamily: "'Outfit', sans-serif', sans-serif", color: '#fff' }}>
                    {data.financialData[data.financialData.length - 1]?.profit.toLocaleString('vi-VN')} đ
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}><InfoCircleOutlined /> Doanh thu trừ chi phí ròng</Text>
                </Card>
              </Col>
            </Row>

            {/* Chart */}
            <Row gutter={20} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card title={<span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>So sánh Doanh thu & Chi phí (6 tháng gần nhất)</span>} style={glassCard}>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={data.financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" stroke={palette.textSecondary} />
                        <YAxis stroke={palette.textSecondary} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="revenue" name="Doanh thu" fill={palette.primary} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expense" name="Chi phí" fill={palette.rose} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Table of expenses */}
            <Row gutter={20}>
              <Col span={24}>
                <Card title={<span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>Báo cáo Chi phí Chi tiết</span>} style={glassCard}>
                  <Table
                    columns={expenseColumns}
                    dataSource={data.recentExpenses}
                    rowKey="_id"
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Spin>

      {/* Modal thêm chi phí */}
      <Modal
        title={<Title level={4} style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>Ghi nhận Chi phí Mới</Title>}
        open={isExpenseModalOpen}
        onCancel={() => {
          setIsExpenseModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddExpense} style={{ marginTop: 16 }}>
          <Form.Item
            name="branchId"
            label={<Text style={{ fontWeight: '500' }}>Chi nhánh / Khu vực</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh phát sinh chi phí' }]}
          >
            <Select style={{ borderRadius: 10 }} placeholder="Chọn chi nhánh">
              {branches.map(b => (
                <Select.Option key={b._id} value={b._id}>{b.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label={<Text style={{ fontWeight: '500' }}>Tên / Nội dung chi phí</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên/mô tả khoản chi' }]}
          >
            <Input placeholder="Ví dụ: Đóng tiền rác khu nhà, Mua thiết bị mạng..." style={{ borderRadius: 10 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label={<Text style={{ fontWeight: '500' }}>Số tiền (VNĐ)</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập số tiền chi' }]}
              >
                <InputNumber
                  style={{ width: '100%', borderRadius: 10 }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)|\s/g, '')}
                  placeholder="Nhập số tiền"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label={<Text style={{ fontWeight: '500' }}>Danh mục</Text>}
                initialValue="other"
              >
                <Select style={{ borderRadius: 10 }}>
                  <Select.Option value="maintenance">Bảo trì & Sửa chữa</Select.Option>
                  <Select.Option value="utilities">Điện/Nước dùng chung</Select.Option>
                  <Select.Option value="salary">Lương nhân viên</Select.Option>
                  <Select.Option value="tax">Thuế & Lệ phí</Select.Option>
                  <Select.Option value="other">Chi phí khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label={<Text style={{ fontWeight: '500' }}>Ngày chi</Text>}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%', borderRadius: 10 }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="note"
            label={<Text style={{ fontWeight: '500' }}>Ghi chú thêm</Text>}
          >
            <Input.TextArea rows={3} placeholder="Ghi chú hóa đơn hoặc thông tin nhà cung cấp..." style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsExpenseModalOpen(false)} style={{ borderRadius: 10 }}>Hủy</Button>
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
                Ghi nhận chi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinancialReport;
