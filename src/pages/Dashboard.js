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
  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Gọi API lấy dữ liệu Dashboard
      const response = await api.get('/dashboard');
      const data = response.data;
      
      setStats({
        totalSales: data.summary.totalSales,
        totalOrders: data.summary.totalOrders,
        totalProducts: data.summary.totalProducts,
        totalCustomers: data.summary.totalCustomers
      });
      
      setRecentOrders(data.recentOrders);
      setLowStockProducts(data.lowStockProducts);
      setSalesData(data.salesData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu tổng quan');
      setLoading(false);
    }
  };

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