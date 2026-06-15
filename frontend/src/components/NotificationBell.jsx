import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Popover, List, Button, Empty, Typography, Space, Tag, Tooltip, Spin } from 'antd';
import { Bell, Check, CheckCheck, Trash2, CreditCard, AlertTriangle, FileText, Info } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const { Text, Paragraph } = Typography;

const API_URL = 'http://localhost:5005/api/notifications';

const typeConfig = {
  payment_reminder: { color: '#fa8c16', icon: <CreditCard size={14} />, label: 'Nhắc đóng tiền' },
  invoice_created: { color: '#1677ff', icon: <FileText size={14} />, label: 'Hóa đơn mới' },
  invoice_overdue: { color: '#ff4d4f', icon: <AlertTriangle size={14} />, label: 'Quá hạn' },
  payment_received: { color: '#52c41a', icon: <Check size={14} />, label: 'Đã thanh toán' },
  contract_expiring: { color: '#722ed1', icon: <FileText size={14} />, label: 'Hợp đồng' },
  system: { color: '#8c8c8c', icon: <Info size={14} />, label: 'Hệ thống' },
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?limit=15`);
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/unread-count`);
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Listen for realtime notifications via Socket.IO
  useEffect(() => {
    if (!socket || !user) return;

    // Join user-specific room
    socket.emit('joinUser', user._id);

    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 15));
      setUnreadCount(prev => prev + 1);
    };

    const handleNewChatMessage = (data) => {
      // Use antd's notification API to show a toast
      import('antd').then(({ notification }) => {
        notification.info({
          message: `Tin nhắn mới từ ${data.senderName}`,
          description: data.message,
          placement: 'bottomRight',
        });
      });
    };

    socket.on('notification', handleNewNotification);
    socket.on('newChatMessage', handleNewChatMessage);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('newChatMessage', handleNewChatMessage);
    };
  }, [socket, user]);

  // Mark single as read
  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_URL}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  // Format time ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const content = (
    <div style={{ width: 380, maxHeight: 480 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', borderBottom: '1px solid #f0f0f0'
      }}>
        <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckCheck size={14} />}
            onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            style={{ padding: '32px 0' }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => {
              const config = typeConfig[item.type] || typeConfig.system;
              return (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    background: item.isRead ? 'transparent' : '#f0f5ff',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f5f5f5',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => !item.isRead && handleMarkRead(item._id)}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Space size={6}>
                        <Tag
                          color={config.color}
                          style={{ margin: 0, fontSize: 11, lineHeight: '18px', padding: '0 6px', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          {config.icon} {config.label}
                        </Tag>
                        {!item.isRead && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677ff', flexShrink: 0 }} />
                        )}
                      </Space>
                      <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                          {timeAgo(item.createdAt)}
                        </Text>
                        <Tooltip title="Xóa">
                          <Button
                            type="text"
                            size="small"
                            icon={<Trash2 size={12} />}
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            style={{ color: '#bfbfbf', padding: 2, height: 20, width: 20 }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>
                      {item.title}
                    </Text>
                    <Paragraph
                      type="secondary"
                      style={{ fontSize: 12, marginBottom: 0, lineHeight: 1.4 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {item.message}
                    </Paragraph>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={(visible) => {
        setOpen(visible);
        if (visible) fetchNotifications();
      }}
      arrow={false}
      styles={{ body: { padding: 0, borderRadius: 12, overflow: 'hidden' } }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<Bell size={20} />}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%'
          }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
