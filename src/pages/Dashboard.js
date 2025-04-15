import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, Typography, Alert } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { Title: TitleText } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API calls
        // const response = await api.get('/dashboard');
        
        // Mock data for demonstration
        setTimeout(() => {
          setStats({
            totalSales: 15800000,
            totalOrders: 124,
            totalProducts: 48,
            totalCustomers: 210
          });
          
          setRecentOrders([
            { id: '1001', customer: 'Nguyễn Văn A', date: '2025-04-12', total: 250000, status: 'completed' },
            { id: '1002', customer: 'Trần Thị B', date: '2025-04-13', total: 180000, status: 'processing' },
            { id: '1003', customer: 'Lê Văn C', date: '2025-04-13', total: 325000, status: 'pending' },
            { id: '1004', customer: 'Phạm Thị D', date: '2025-04-14', total: 140000, status: 'completed' },
          ]);
          
          setLowStockProducts([
            { id: 1, name: 'Khoai tây chiên', stock: 5, category: 'Đồ ăn mặn' },
            { id: 2, name: 'Nước ngọt Coca', stock: 8, category: 'Đồ uống' },
            { id: 3, name: 'Bánh quy socola', stock: 3, category: 'Bánh ngọt' },
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu tổng quan');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `${total.toLocaleString()}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Hoàn thành';
        
        if (status === 'pending') {
          color = 'gold';
          text = 'Chờ xử lý';
        } else if (status === 'processing') {
          color = 'blue';
          text = 'Đang xử lý';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const lowStockColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => <Tag color={stock <= 5 ? 'red' : 'orange'}>{stock}</Tag>,
    },
  ];

  const salesData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        data: [12.5, 14.2, 11.8, 13.5, 16.2, 14.8, 15.9, 17.2, 18.5, 16.8, 17.5, 15.8],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Doanh thu theo tháng',
      },
    },
  };

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <Spin spinning={loading}>
      <TitleText level={2}>{t('dashboard')}</TitleText>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('total_sales')}
              value={stats.totalSales}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="đ"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('total_orders')}
              value={stats.totalOrders}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('total_products')}
              value={stats.totalProducts}
              valueStyle={{ color: '#722ed1' }}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('total_customers')}
              value={stats.totalCustomers}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Biểu đồ doanh thu">
            <Bar options={chartOptions} data={salesData} height={80} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title={t('recent_orders')} extra={<a href="/orders">Xem tất cả</a>}>
            <Table 
              columns={orderColumns} 
              dataSource={recentOrders} 
              rowKey="id" 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('low_stock')} extra={<a href="/products">Xem tất cả</a>}>
            <Table 
              columns={lowStockColumns} 
              dataSource={lowStockProducts} 
              rowKey="id" 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default Dashboard;