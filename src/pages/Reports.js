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

ChartJS.register(...registerables);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [reportData, setReportData] = useState(null);
  const [productTimeRange, setProductTimeRange] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeTab, productTimeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        // Sales Data
        const salesData = {
          summary: {
            totalSales: 15800000,
            totalOrders: 124,
            averageOrderValue: 127419,
            comparisonPercentage: 12.5
          },
          dailySales: [
            { date: '2025-03-16', sales: 580000, orders: 5 },
            { date: '2025-03-17', sales: 720000, orders: 6 },
            { date: '2025-03-18', sales: 450000, orders: 4 },
            { date: '2025-03-19', sales: 620000, orders: 5 },
            { date: '2025-03-20', sales: 530000, orders: 4 },
            { date: '2025-03-21', sales: 810000, orders: 7 },
            { date: '2025-03-22', sales: 920000, orders: 8 },
            { date: '2025-03-23', sales: 750000, orders: 6 },
            { date: '2025-03-24', sales: 680000, orders: 5 },
            { date: '2025-03-25', sales: 540000, orders: 4 },
            { date: '2025-03-26', sales: 490000, orders: 4 },
            { date: '2025-03-27', sales: 650000, orders: 5 },
            { date: '2025-03-28', sales: 720000, orders: 6 },
            { date: '2025-03-29', sales: 830000, orders: 7 },
            { date: '2025-03-30', sales: 780000, orders: 6 },
            { date: '2025-03-31', sales: 690000, orders: 5 },
            { date: '2025-04-01', sales: 570000, orders: 5 },
            { date: '2025-04-02', sales: 630000, orders: 5 },
            { date: '2025-04-03', sales: 710000, orders: 6 },
            { date: '2025-04-04', sales: 590000, orders: 5 },
            { date: '2025-04-05', sales: 850000, orders: 7 },
            { date: '2025-04-06', sales: 920000, orders: 8 },
            { date: '2025-04-07', sales: 750000, orders: 6 },
            { date: '2025-04-08', sales: 680000, orders: 5 },
            { date: '2025-04-09', sales: 720000, orders: 6 },
            { date: '2025-04-10', sales: 640000, orders: 5 },
            { date: '2025-04-11', sales: 580000, orders: 5 },
            { date: '2025-04-12', sales: 710000, orders: 6 },
            { date: '2025-04-13', sales: 890000, orders: 7 },
            { date: '2025-04-14', sales: 740000, orders: 6 },
          ],
          topProducts: [
            { id: 1, name: 'Bánh quy socola', sales: 2500000, quantity: 100, percentage: 15.8 },
            { id: 2, name: 'Khoai tây chiên', sales: 1850000, quantity: 123, percentage: 11.7 },
            { id: 3, name: 'Nước ngọt Coca', sales: 1680000, quantity: 140, percentage: 10.6 },
            { id: 4, name: 'Bánh mì que', sales: 1320000, quantity: 165, percentage: 8.4 },
            { id: 5, name: 'Snack bim bim', sales: 1250000, quantity: 125, percentage: 7.9 },
          ],
          salesByCategory: [
            { category: 'Bánh ngọt', sales: 4800000, percentage: 30.4 },
            { category: 'Đồ ăn mặn', sales: 4200000, percentage: 26.6 },
            { category: 'Đồ uống', sales: 3700000, percentage: 23.4 },
            { category: 'Bánh mì', sales: 1600000, percentage: 10.1 },
            { category: 'Khác', sales: 1500000, percentage: 9.5 },
          ]
        };

        // Products Data
        const productsData = {
          summary: {
            totalProducts: 48,
            lowStockProducts: 8,
            outOfStockProducts: 2,
            newProducts: 5
          },
          topSelling: [
            { id: 1, name: 'Bánh quy socola', sales: 2500000, quantity: 100 },
            { id: 2, name: 'Khoai tây chiên', sales: 1850000, quantity: 123 },
            { id: 3, name: 'Nước ngọt Coca', sales: 1680000, quantity: 140 },
            { id: 4, name: 'Bánh mì que', sales: 1320000, quantity: 165 },
            { id: 5, name: 'Snack bim bim', sales: 1250000, quantity: 125 },
          ],
          lowStock: [
            { id: 1, name: 'Bánh quy socola', stock: 5, category: 'Bánh ngọt' },
            { id: 2, name: 'Nước ngọt Coca', stock: 8, category: 'Đồ uống' },
            { id: 3, name: 'Bánh Donut', stock: 3, category: 'Bánh ngọt' },
            { id: 4, name: 'Trà sữa trân châu', stock: 7, category: 'Đồ uống' },
          ]
        };

        // Customers Data
        const customersData = {
          summary: {
            totalCustomers: 210,
            newCustomers: 15,
            returningCustomers: 195,
            averagePurchaseValue: 127419
          },
          topCustomers: [
            { id: 1, name: 'Nguyễn Văn A', orders: 5, spent: 875000 },
            { id: 2, name: 'Trần Thị B', orders: 4, spent: 720000 },
            { id: 3, name: 'Lê Văn C', orders: 3, spent: 580000 },
            { id: 4, name: 'Phạm Thị D', orders: 3, spent: 540000 },
            { id: 5, name: 'Hoàng Văn E', orders: 2, spent: 420000 },
          ],
          customerGrowth: [
            { month: 'T1/2025', customers: 150 },
            { month: 'T2/2025', customers: 165 },
            { month: 'T3/2025', customers: 185 },
            { month: 'T4/2025', customers: 210 },
          ]
        };

        setReportData({
          sales: salesData,
          products: productsData,
          customers: customersData
        });

        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching report data:', err);
      message.error('Không thể tải dữ liệu báo cáo');
      setLoading(false);
    }
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
    if (!reportData || !reportData.sales) return <Spin />;

    const { summary, dailySales, topProducts, salesByCategory } = reportData.sales;

    // Data for line chart
    const salesChartData = {
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
    };

    // Data for bar chart
    const ordersChartData = {
      labels: dailySales.map(item => moment(item.date).format('DD/MM')),
      datasets: [
        {
          label: 'Số đơn hàng',
          data: dailySales.map(item => item.orders),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };

    // Data for pie chart - FIX: complete the mapping function
    const categoryChartData = {
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
    };

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
              <Line data={salesChartData} options={{ maintainAspectRatio: false }} height={300} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Đơn hàng theo ngày">
              <Bar data={ordersChartData} options={{ maintainAspectRatio: false }} height={300} />
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
              <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} height={300} />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const renderProductsReport = () => {
    if (!reportData || !reportData.products) return <Spin />;

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
    if (!reportData || !reportData.customers) return <Spin />;

    const { summary, topCustomers, customerGrowth } = reportData.customers;

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

    // Data for customer growth chart
    const customerGrowthData = {
      labels: customerGrowth.map(item => item.month),
      datasets: [
        {
          label: 'Số lượng khách hàng',
          data: customerGrowth.map(item => item.customers),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

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
              <Bar data={customerGrowthData} options={{ maintainAspectRatio: false }} height={300} />
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 24 }}>
        <Title level={2}>Báo cáo</Title>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            {
              key: 'sales',
              label: <span><BarChartOutlined /> Doanh thu</span>,
              children: renderSalesReport()
            },
            {
              key: 'products',
              label: <span><PieChartOutlined /> Sản phẩm</span>,
              children: renderProductsReport()
            },
            {
              key: 'customers',
              label: <span><LineChartOutlined /> Khách hàng</span>,
              children: renderCustomersReport()
            }
          ]}
        />
      </div>
    </Spin>
  );
};

export default Reports;