import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, Typography, Alert } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import SafeChart from '../components/SafeChart';
import { registerChartJS } from '../chartConfig'; // Import hàm đăng ký

// Đăng ký chart.js
registerChartJS();

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
  const [salesData, setSalesData] = useState({
    labels: ['Không có dữ liệu'],
    datasets: [{
      label: 'Doanh thu',
      data: [0],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      pointBorderColor: '#fff',
      pointRadius: 5,
    }]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sửa phần fetchDashboardData
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu thống kê
      const ordersResponse = await api.get('/orders');
      const snacksResponse = await api.get('/snacks');
      const orders = ordersResponse.data;
      const snacks = snacksResponse.data;
      
      // Tính toán thống kê
      const totalSales = orders.reduce((sum, order) => sum + (order.finalTotal || order.total), 0);
      const totalOrders = orders.length;
      const totalProducts = snacks.length;
      
      setStats({
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers: 0 // Cần API riêng cho khách hàng
      });
      
      // Lấy đơn hàng gần đây
      const recentOrdersData = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order._id,
          customer: order.userName || 'Khách hàng',
          date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
          total: order.finalTotal || order.total,
          status: order.status.toLowerCase()
        }));
      
      setRecentOrders(recentOrdersData);
      
      // Lấy sản phẩm sắp hết hàng
      const lowStockProductsData = snacks
        .filter(snack => snack.stock <= 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5)
        .map(snack => ({
          id: snack._id,
          name: snack.snackName,
          category: getCategoryName(snack.categoryId),
          stock: snack.stock
        }));
      
      setLowStockProducts(lowStockProductsData);
      
      // Create simplified sales data
      const salesByMonth = {};
      orders.forEach(order => {
        const month = new Date(order.createdAt).getMonth();
        const year = new Date(order.createdAt).getFullYear();
        const key = `${year}-${month}`;
        if (!salesByMonth[key]) {
          salesByMonth[key] = 0;
        }
        salesByMonth[key] += (order.finalTotal || order.total);
      });
      
      const labels = Object.keys(salesByMonth).map(key => {
        const [year, month] = key.split('-');
        return `${parseInt(month) + 1}/${year}`;
      });
      
      const data = Object.values(salesByMonth);
      
      // Nếu không có dữ liệu hoặc dữ liệu rỗng, sử dụng dữ liệu mặc định
      if (!data || data.length === 0) {
        setSalesData({
          labels: ['Không có dữ liệu'],
          datasets: [{
            label: 'Doanh thu',
            data: [0],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          }]
        });
        return;
      }
      
      // Xử lý dữ liệu hợp lệ
      setSalesData({
        labels,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }]
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu tổng quan');
      setLoading(false);
      // Sử dụng dữ liệu mặc định trong trường hợp lỗi
      setSalesData({
        labels: ['Lỗi dữ liệu'],
        datasets: [{
          label: 'Doanh thu',
          data: [0],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }]
      });
    }
  };

  // Helper function to convert category ID to name
  const getCategoryName = (categoryId) => {
    const categoriesMap = {
      'banh': 'Bánh',
      'keo': 'Kẹo',
      'do_kho': 'Đồ khô',
      'mut': 'Mứt',
      'hat': 'Hạt'
    };
    return categoriesMap[categoryId] || categoryId;
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
            <SafeChart 
              chartType="line" 
              data={salesData} 
              options={chartOptions} 
              height={300}
            />
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