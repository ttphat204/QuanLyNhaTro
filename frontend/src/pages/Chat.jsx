import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Menu, Input, Button, Avatar, 
  Typography, Space, Badge, message, Image, Spin
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  SmileOutlined, 
  PictureOutlined 
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  // Fetch message history when room is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoom) {
        try {
          const response = await axios.get(`http://localhost:5005/api/messages/${selectedRoom._id}`);
          setMessages(response.data.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
          message.error('Không thể tải lịch sử tin nhắn');
        }
      }
    };
    fetchMessages();
  }, [selectedRoom]);

  useEffect(() => {
    // Fetch rooms (for admin, it's a list of rooms, for tenant it's their room)
    const fetchRooms = async () => {
      try {
        const endpoint = user.role === 'tenant' ? '/api/rooms/my-room' : '/api/rooms';
        const response = await axios.get(`http://localhost:5005${endpoint}`);
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setRooms(data);
        if (data.length > 0) {
          setSelectedRoom(data[0]);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, [user.role]);

  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('joinRoom', selectedRoom._id);

      socket.on('message', (msg) => {
        // Only add to state if it's not already there (to prevent duplicates if history fetch overlaps)
        setMessages((prev) => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });

      socket.on('typing', ({ userName }) => {
        setTypingUser(userName);
      });

      socket.on('stopTyping', () => {
        setTypingUser('');
      });

      return () => {
        socket.off('message');
        socket.off('typing');
        socket.off('stopTyping');
      };
    }
  }, [socket, selectedRoom]);

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !selectedRoom) return;

    const msgData = {
      roomId: selectedRoom._id,
      message: inputValue,
      senderId: user._id,
      senderName: user.fullName,
      type: 'text'
    };

    socket.emit('sendMessage', msgData);
    setInputValue('');
    socket.emit('stopTyping', selectedRoom._id);
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setInputValue(e.target.value);
    if (!socket || !selectedRoom) return;

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socket.emit('typing', { roomId: selectedRoom._id, userName: user.fullName });
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      socket.emit('stopTyping', selectedRoom._id);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      return message.error('Vui lòng chọn file hình ảnh!');
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      return message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post('http://localhost:5005/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageUrl = res.data.data.url;

      const msgData = {
        roomId: selectedRoom._id,
        message: imageUrl,
        senderId: user._id,
        senderName: user.fullName,
        type: 'image'
      };

      socket.emit('sendMessage', msgData);
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Layout style={{ height: 'calc(100vh - 120px)', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
      {user.role !== 'tenant' && (
        <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0 }}>Hội thoại</Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedRoom?._id]}
            onSelect={({ key }) => setSelectedRoom(rooms.find(r => r._id === key))}
            style={{ borderRight: 0 }}
          >
            {rooms.map(room => (
              <Menu.Item key={room._id} icon={<Avatar icon={<UserOutlined />} size="small" />}>
                Phòng {room.roomNumber}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
      )}

      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Avatar size="large" icon={<UserOutlined />} />
            <div>
              <Text strong style={{ display: 'block' }}>
                {user.role === 'tenant' ? 'Hỗ trợ Chủ nhà' : `Phòng ${selectedRoom?.roomNumber}`}
              </Text>
              <Badge status="processing" text="Trực tuyến" />
            </div>
          </Space>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f9f9f9' }}>
          {messages.map((msg, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: msg.senderId === user._id ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ 
                    padding: msg.type === 'image' ? '0' : '10px 16px', 
                    borderRadius: '12px',
                    background: msg.type === 'image' ? 'transparent' : (msg.senderId === user._id ? '#1677ff' : '#fff'),
                    color: msg.type === 'image' ? 'inherit' : (msg.senderId === user._id ? '#fff' : '#000'),
                    boxShadow: msg.type === 'image' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                  }}>
                    {msg.type === 'image' ? (
                      <Image 
                        src={msg.message} 
                        alt="chat-image" 
                        style={{ maxWidth: '250px', maxHeight: '300px', borderRadius: '12px', objectFit: 'cover' }}
                        preview={{ maskClassName: 'chat-image-mask' }}
                      />
                    ) : (
                      msg.message
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block', textAlign: msg.senderId === user._id ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
              </div>
            ))}
          {typingUser && (
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary" italic>{typingUser} đang soạn tin nhắn...</Text>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input 
              placeholder="Nhập tin nhắn..." 
              value={inputValue}
              onChange={handleTyping}
              onPressEnter={handleSend}
              suffix={
                <Space>
                  <SmileOutlined style={{ color: '#bfbfbf', cursor: 'pointer' }} />
                  {uploadingImage ? (
                    <Spin size="small" />
                  ) : (
                    <PictureOutlined 
                      style={{ color: '#1677ff', cursor: 'pointer', fontSize: '18px' }} 
                      onClick={() => fileInputRef.current?.click()}
                    />
                  )}
                </Space>
              }
              size="large"
              disabled={uploadingImage}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} size="large" disabled={uploadingImage}>
              Gửi
            </Button>
          </Space.Compact>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageUpload}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Chat;
