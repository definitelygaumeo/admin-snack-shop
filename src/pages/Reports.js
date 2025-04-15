import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, DatePicker, 
  Table, Select, Button, Statistic, Tabs,
  Divider, Spin, message
} from 'antd';
import { 
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  DownloadOutlined, FilterOutlined, ReloadOutlined,
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import moment from 'moment';
import SafeChart from '../components/SafeChart';
// Add API import
import api from '../services/api';

ChartJS.register(...registerables);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Khởi tạo dữ liệu mẫu ban đầu để tránh lỗi null
const emptyLineChartData = {
  labels: [''],
  datasets: [
    {
      label: '',
      data: [0],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

const emptyBarChartData = {
  labels: [''],
  datasets: [
    {
      label: '',
      data: [0],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    },
  ],
};

const emptyPieChartData = {
  labels: ['No Data'],
  datasets: [
    {
      data: [1],
      backgroundColor: ['rgba(200, 200, 200, 0.6)'],
      borderWidth: 1,
    },
  ],
};

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [reportData, setReportData] = useState({
    sales: null,
    products: null,
    customers: null
  });
  const [productTimeRange, setProductTimeRange] = useState('month');
  
  // Thêm biến state cho các biểu đồ để đảm bảo luôn có dữ liệu
  const [salesChartData, setSalesChartData] = useState(emptyLineChartData);
  const [ordersChartData, setOrdersChartData] = useState(emptyBarChartData);
  const [categoryChartData, setCategoryChartData] = useState(emptyPieChartData);
  const [customerGrowthData, setCustomerGrowthData] = useState(emptyBarChartData);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeTab, productTimeRange]);

  useEffect(() => {
    // Cập nhật dữ liệu biểu đồ khi reportData thay đổi
    if (reportData.sales) {
      updateSalesCharts();
    }
    
    if (reportData.customers) {
      updateCustomerCharts();
    }
  }, [reportData]);

const updateSalesCharts = () => {
  try {
    // Kiểm tra dữ liệu tồn tại trước khi truy cập
    if (!reportData || !reportData.sales) {
      return;
    }
    
    const { dailySales, salesByCategory } = reportData.sales;
    
    if (dailySales && Array.isArray(dailySales) && dailySales.length > 0) {
      setSalesChartData({
        labels: dailySales.map(item => moment(item.date).format('DD/MM')),
        datasets: [
          {
            label: 'Doanh thu (nghìn đồng)',
            data: dailySales.map(item => item.sales / 1000),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true,
          },
        ],
      });
      
      setOrdersChartData({
        labels: dailySales.map(item => moment(item.date).format('DD/MM')),
        datasets: [
          {
            label: 'Số đơn hàng',
            data: dailySales.map(item => item.orders),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      });
    }
    
    if (salesByCategory && Array.isArray(salesByCategory) && salesByCategory.length > 0) {
      setCategoryChartData({
        labels: salesByCategory.map(item => item.category),
        datasets: [
          {
            data: salesByCategory.map(item => item.percentage),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderWidth: 1,
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error updating sales charts:", error);
    // Fallback to empty data
    setSalesChartData(emptyLineChartData);
    setOrdersChartData(emptyBarChartData);
    setCategoryChartData(emptyPieChartData);
  }
};

const updateCustomerCharts = () => {
  try {
    // Kiểm tra dữ liệu tồn tại trước khi truy cập
    if (!reportData || !reportData.customers) {
      return;
    }
    
    const { customerGrowth } = reportData.customers;
    
    if (customerGrowth && Array.isArray(customerGrowth) && customerGrowth.length > 0) {
      setCustomerGrowthData({
        labels: customerGrowth.map(item => item.month),
        datasets: [
          {
            label: 'Số lượng khách hàng',
            data: customerGrowth.map(item => item.customers),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error updating customer charts:", error);
    setCustomerGrowthData(emptyBarChartData);
  }
};

// Sửa phần fetchReportData để sử dụng dữ liệu thực từ API
const fetchReportData = async () => {
  setLoading(true);
  try {
    // Lấy dữ liệu từ API
    const [ordersRes, snacksRes] = await Promise.all([
      api.get('/orders'),
      api.get('/snacks')
    ]);
    
    const orders = ordersRes.data;
    const snacks = snacksRes.data;
    
    // Xử lý dữ liệu báo cáo doanh thu
    const salesData = processSalesData(orders);
    
    // Xử lý dữ liệu báo cáo sản phẩm
    const productsData = processProductsData(snacks, orders);
    
    // Xử lý dữ liệu báo cáo khách hàng (giả lập)
    const customersData = {
      summary: {
        totalCustomers: 0, // Cần API riêng
        newCustomers: 0,
        returningCustomers: 0,
        averagePurchaseValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + (order.finalTotal || order.total), 0) / orders.length 
          : 0
      },
      topCustomers: [], // Cần API riêng
      customerGrowth: [] // Cần API riêng
    };

    setReportData({
      sales: salesData,
      products: productsData,
      customers: customersData
    });

    setLoading(false);
  } catch (err) {
    console.error('Error fetching report data:', err);
    message.error('Không thể tải dữ liệu báo cáo');
    setLoading(false);
  }
};

// Helper functions
const processSalesData = (orders) => {
  // Tổng kết doanh thu
  const totalSales = orders.reduce((sum, order) => sum + (order.finalTotal || order.total), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  // Doanh thu theo ngày
  const dailySales = [];
  const salesByDay = {};
  
  orders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    if (!salesByDay[date]) {
      salesByDay[date] = { sales: 0, orders: 0 };
    }
    salesByDay[date].sales += (order.finalTotal || order.total);
    salesByDay[date].orders += 1;
  });
  
  Object.entries(salesByDay).forEach(([date, data]) => {
    dailySales.push({
      date,
      sales: data.sales,
      orders: data.orders
    });
  });
  
  // Sắp xếp theo ngày
  dailySales.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Chỉ lấy 7 ngày gần nhất
  const recentDailySales = dailySales.slice(-7);
  
  // Doanh thu theo danh mục
  const salesByCategory = [];
  
  return {
    summary: {
      totalSales,
      totalOrders,
      averageOrderValue,
      comparisonPercentage: 0 // Cần dữ liệu tháng trước để tính
    },
    dailySales: recentDailySales,
    topProducts: [], // Cần dữ liệu chi tiết hơn để tính
    salesByCategory
  };
};

const processProductsData = (snacks, orders) => {
  return {
    summary: {
      totalProducts: snacks.length,
      lowStockProducts: snacks.filter(snack => snack.stock <= 10).length,
      outOfStockProducts: snacks.filter(snack => snack.stock === 0).length,
      newProducts: snacks.filter(snack => {
        const createdDate = new Date(snack.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length
    },
    topSelling: [], // Cần dữ liệu chi tiết hơn
    lowStock: snacks
      .filter(snack => snack.stock <= 10)
      .map(snack => ({
        id: snack._id,
        name: snack.snackName,
        stock: snack.stock,
        category: getCategoryName(snack.categoryId)
      }))
  };
};

// Helper function cho tên danh mục
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

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleProductTimeRangeChange = (value) => {
    setProductTimeRange(value);
  };

  const exportReport = () => {
    message.success('Xuất báo cáo thành công');
  };

  const renderSalesReport = () => {
    if (!reportData.sales) {
      return <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>;
    }

    const { summary, topProducts } = reportData.sales;

    const topProductColumns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Doanh thu',
        dataIndex: 'sales',
        key: 'sales',
        render: (sales) => `${sales.toLocaleString()}đ`,
        sorter: (a, b) => a.sales - b.sales,
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        sorter: (a, b) => a.quantity - b.quantity,
      },
      {
        title: 'Tỷ lệ',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (percentage) => `${percentage}%`,
        sorter: (a, b) => a.percentage - b.percentage,
      },
    ];

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Thống kê doanh thu"
              extra={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <RangePicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                  />
                  <Button icon={<DownloadOutlined />} onClick={exportReport}>
                    Xuất báo cáo
                  </Button>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng doanh thu"
                    value={summary.totalSales}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DollarOutlined />}
                    suffix="đ"
                    formatter={(value) => `${value.toLocaleString()}`}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng đơn hàng"
                    value={summary.totalOrders}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Giá trị trung bình/đơn"
                    value={summary.averageOrderValue}
                    precision={0}
                    valueStyle={{ color: '#722ed1' }}
                    suffix="đ"
                    formatter={(value) => `${value.toLocaleString()}`}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="So với tháng trước"
                    value={summary.comparisonPercentage}
                    precision={1}
                    valueStyle={{
                      color: summary.comparisonPercentage >= 0 ? '#3f8600' : '#cf1322',
                    }}
                    prefix={summary.comparisonPercentage >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    suffix="%"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card title="Doanh thu theo ngày">
              {salesChartData && salesChartData.labels ? (
                <Line 
                  data={salesChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true 
                  }} 
                  height={300} 
                />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                  Đang tải dữ liệu...
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Đơn hàng theo ngày">
              {ordersChartData && ordersChartData.labels ? (
                <Bar 
                  data={ordersChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true 
                  }} 
                  height={300} 
                />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                  Đang tải dữ liệu...
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={16}>
            <Card title="Top sản phẩm bán chạy">
              <Table
                columns={topProductColumns}
                dataSource={topProducts}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Doanh thu theo danh mục">
              {categoryChartData && categoryChartData.labels ? (
                <Pie 
                  data={categoryChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true 
                  }} 
                  height={300} 
                />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                  Đang tải dữ liệu...
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderProductsReport = () => {
    if (!reportData.products) {
      return <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>;
    }

    const { summary, topSelling, lowStock } = reportData.products;

    const topSellingColumns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Doanh thu',
        dataIndex: 'sales',
        key: 'sales',
        render: (sales) => `${sales.toLocaleString()}đ`,
        sorter: (a, b) => a.sales - b.sales,
      },
      {
        title: 'Số lượng bán',
        dataIndex: 'quantity',
        key: 'quantity',
        sorter: (a, b) => a.quantity - b.quantity,
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
        render: (stock) => {
          let color = 'green';
          if (stock <= 5) {
            color = 'red';
          } else if (stock <= 10) {
            color = 'orange';
          }
          return <span style={{ color }}>{stock}</span>;
        },
        sorter: (a, b) => a.stock - b.stock,
      },
    ];

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Thống kê sản phẩm"
              extra={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Select
                    defaultValue={productTimeRange}
                    style={{ width: 120 }}
                    onChange={handleProductTimeRangeChange}
                  >
                    <Option value="week">7 ngày qua</Option>
                    <Option value="month">30 ngày qua</Option>
                    <Option value="quarter">3 tháng qua</Option>
                    <Option value="year">1 năm qua</Option>
                  </Select>
                  <Button icon={<DownloadOutlined />} onClick={exportReport}>
                    Xuất báo cáo
                  </Button>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng số sản phẩm"
                    value={summary.totalProducts}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Sản phẩm sắp hết"
                    value={summary.lowStockProducts}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Sản phẩm đã hết"
                    value={summary.outOfStockProducts}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Sản phẩm mới"
                    value={summary.newProducts}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Top sản phẩm bán chạy">
              <Table
                columns={topSellingColumns}
                dataSource={topSelling}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Sản phẩm sắp hết hàng">
              <Table
                columns={lowStockColumns}
                dataSource={lowStock}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderCustomersReport = () => {
    if (!reportData.customers) {
      return <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>;
    }

    const { summary, topCustomers } = reportData.customers;

    const topCustomersColumns = [
      {
        title: 'Khách hàng',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số đơn hàng',
        dataIndex: 'orders',
        key: 'orders',
        sorter: (a, b) => a.orders - b.orders,
      },
      {
        title: 'Tổng chi tiêu',
        dataIndex: 'spent',
        key: 'spent',
        render: (spent) => `${spent.toLocaleString()}đ`,
        sorter: (a, b) => a.spent - b.spent,
      },
    ];

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Thống kê khách hàng"
              extra={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button icon={<DownloadOutlined />} onClick={exportReport}>
                    Xuất báo cáo
                  </Button>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng khách hàng"
                    value={summary.totalCustomers}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Khách hàng mới"
                    value={summary.newCustomers}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Khách hàng quay lại"
                    value={summary.returningCustomers}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Chi tiêu trung bình"
                    value={summary.averagePurchaseValue}
                    precision={0}
                    valueStyle={{ color: '#fa8c16' }}
                    suffix="đ"
                    formatter={(value) => `${value.toLocaleString()}`}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={16}>
            <Card title="Top khách hàng">
              <Table
                columns={topCustomersColumns}
                dataSource={topCustomers}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Tăng trưởng khách hàng">
              {customerGrowthData && customerGrowthData.labels ? (
                <Bar 
                  data={customerGrowthData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true 
                  }} 
                  height={300} 
                />
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                  Đang tải dữ liệu...
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return <Spin tip="Đang tải dữ liệu..." style={{ display: 'block', margin: '100px auto' }} />;
    }

    switch (activeTab) {
      case 'sales':
        return renderSalesReport();
      case 'products':
        return renderProductsReport();
      case 'customers':
        return renderCustomersReport();
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Báo cáo</Title>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        items={[
          {
            key: 'sales',
            label: <span><BarChartOutlined /> Doanh thu</span>,
          },
          {
            key: 'products',
            label: <span><PieChartOutlined /> Sản phẩm</span>,
          },
          {
            key: 'customers',
            label: <span><LineChartOutlined /> Khách hàng</span>,
          }
        ]}
      />
      
      {renderTabContent()}
    </div>
  );
};

export default Reports;