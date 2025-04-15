import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Table, Tag, Button, Steps, Divider,
  Typography, Row, Col, Statistic, Space, message, Modal, Select
} from 'antd';
import {
  ShoppingOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, RollbackOutlined, PrinterOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
// Thêm import api
import api from '../services/api';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      const orderData = response.data;
      
      // Transform data to match the expected format in component
      const formattedOrder = {
        id: orderData._id,
        date: orderData.createdAt,
        status: orderData.status.toLowerCase(),
        customer: {
          name: orderData.userName || 'Khách hàng',
          phone: orderData.phoneNumber || 'N/A',
          email: orderData.email || 'N/A',
          address: orderData.shippingAddress || 'N/A'
        },
        paymentMethod: orderData.paymentMethod || 'COD',
        paymentStatus: orderData.paymentStatus || 'pending',
        shippingFee: orderData.shippingFee || 0,
        subtotal: orderData.total - (orderData.shippingFee || 0),
        total: orderData.finalTotal || orderData.total,
        notes: orderData.notes || '',
        statusHistory: orderData.statusHistory || [{
          status: orderData.status.toLowerCase(),
          date: orderData.createdAt,
          text: `Đơn hàng ${orderData.status.toLowerCase() === 'pending' ? 'đã được tạo' : 'đang được xử lý'}`
        }],
        items: orderData.items.map(item => ({
          id: item.snackId._id || item.snackId,
          name: item.snackName || 'Sản phẩm',
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          image: item.image || 'https://via.placeholder.com/80'
        }))
      };
      
      setOrder(formattedOrder);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order details:', err);
      message.error('Không thể tải thông tin đơn hàng');
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipping': return 2;
      case 'completed': return 3;
      case 'cancelled': return 4;
      default: return 0;
    }
  };

  const handleBack = () => {
    navigate('/orders');
  };

  const handlePrint = () => {
    message.success('Đang in đơn hàng...');
  };

  const showStatusModal = () => {
    setNewStatus(order.status);
    setIsStatusModalVisible(true);
  };

  const handleStatusChange = (value) => {
    setNewStatus(value);
  };

  const updateOrderStatus = async () => {
    setLoading(true);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus.toUpperCase() });
      
      // Add new status to history
      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      let statusText = '';
      
      switch (newStatus) {
        case 'pending': statusText = 'Đơn hàng đã được tạo'; break;
        case 'processing': statusText = 'Đơn hàng đang được xử lý'; break;
        case 'shipping': statusText = 'Đơn hàng đang được giao'; break;
        case 'completed': statusText = 'Đơn hàng đã hoàn thành'; break;
        case 'cancelled': statusText = 'Đơn hàng đã bị hủy'; break;
        default: statusText = 'Cập nhật trạng thái đơn hàng';
      }
      
      const updatedOrder = {
        ...order,
        status: newStatus,
        statusHistory: [
          ...order.statusHistory,
          { status: newStatus, date: now, text: statusText }
        ]
      };
      
      setOrder(updatedOrder);
      setIsStatusModalVisible(false);
      setLoading(false);
      message.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (err) {
      console.error('Error updating order status:', err);
      message.error('Không thể cập nhật trạng thái đơn hàng: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    let color = 'green';
    let text = 'Hoàn thành';
    let icon = <CheckCircleOutlined />;
    
    if (status === 'pending') {
      color = 'gold';
      text = 'Chờ xử lý';
      icon = <ClockCircleOutlined />;
    } else if (status === 'processing') {
      color = 'blue';
      text = 'Đang xử lý';
      icon = <ShoppingOutlined />;
    } else if (status === 'shipping') {
      color = 'cyan';
      text = 'Đang giao hàng';
      icon = <ShoppingOutlined />;
    } else if (status === 'cancelled') {
      color = 'red';
      text = 'Đã hủy';
      icon = <CloseCircleOutlined />;
    }
    
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const itemColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={record.image} alt={text} style={{ width: 40, height: 40, marginRight: 10 }} />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: price => `${price.toLocaleString()}đ`,
      align: 'right'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: total => `${total.toLocaleString()}đ`,
      align: 'right'
    }
  ];

  if (loading || !order) {
    return <Card loading={true} />;
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={2}>Chi tiết đơn hàng #{order.id}</Title>
        <Space>
          <Button icon={<RollbackOutlined />} onClick={handleBack}>Quay lại</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>In đơn hàng</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Thông tin đơn hàng">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt">{moment(order.date).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Space>
                      {getStatusTag(order.status)}
                      <Button type="link" onClick={showStatusModal}>Cập nhật</Button>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú">{order.notes || 'Không có'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} sm={12}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Thanh toán">{order.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng' : 'Chuyển khoản'}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái thanh toán">
                    <Tag color={order.paymentStatus === 'paid' ? 'green' : 'gold'}>
                      {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Thông tin khách hàng">
            <Descriptions column={1}>
              <Descriptions.Item label="Họ tên">{order.customer.name}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{order.customer.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{order.customer.email}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{order.customer.address}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Thông tin vận chuyển">
            <Descriptions column={1}>
              <Descriptions.Item label="Địa chỉ giao hàng">{order.customer.address}</Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">{order.shippingFee.toLocaleString()}đ</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Chi tiết sản phẩm">
            <Table 
              columns={itemColumns} 
              dataSource={order.items} 
              rowKey="id" 
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}><Text strong>Tạm tính</Text></Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <Text strong>{order.subtotal.toLocaleString()}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}><Text>Phí vận chuyển</Text></Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <Text>{order.shippingFee.toLocaleString()}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}><Text strong>Tổng cộng</Text></Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>{order.total.toLocaleString()}đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Lịch sử đơn hàng">
            <Steps direction="vertical" current={getStatusStep(order.status)} status={order.status === 'cancelled' ? 'error' : 'process'}>
              {order.statusHistory.map((history, index) => (
                <Step 
                  key={index} 
                  title={(() => {
                    switch (history.status) {
                      case 'pending': return 'Chờ xử lý';
                      case 'processing': return 'Đang xử lý';
                      case 'shipping': return 'Đang giao hàng';
                      case 'completed': return 'Hoàn thành';
                      case 'cancelled': return 'Đã hủy';
                      default: return history.status;
                    }
                  })()} 
                  description={
                    <div>
                      {history.text}<br />
                      <small>{moment(history.date).format('DD/MM/YYYY HH:mm:ss')}</small>
                    </div>
                  } 
                />
              ))}
            </Steps>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        visible={isStatusModalVisible}
        onOk={updateOrderStatus}
        onCancel={() => setIsStatusModalVisible(false)}
        confirmLoading={loading}
      >
        <Select
          style={{ width: '100%' }}
          value={newStatus}
          onChange={handleStatusChange}
        >
          <Option value="pending">Chờ xử lý</Option>
          <Option value="processing">Đang xử lý</Option>
          <Option value="shipping">Đang giao hàng</Option>
          <Option value="completed">Hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      </Modal>
    </>
  );
};

export default OrderDetail;