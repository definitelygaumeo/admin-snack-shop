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
import api from '../services/api';

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
      let endpoint = '';
      let params = {};
      
      // Xác định endpoint và tham số dựa trên tab đang chọn
      if (activeTab === 'sales') {
        endpoint = '/reports/sales';
        params = {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        };
      } else if (activeTab === 'products') {
        endpoint = '/reports/products';
        params = { timeRange: productTimeRange };
      } else if (activeTab === 'customers') {
        endpoint = '/reports/customers';
      }
      
      const response = await api.get(endpoint, { params });
      
      // Cập nhật state với dữ liệu từ API
      if (activeTab === 'sales') {
        setReportData({
          ...reportData,
          sales: response.data
        });
      } else if (activeTab === 'products') {
        setReportData({
          ...reportData,
          products: response.data
        });
      } else if (activeTab === 'customers') {
        setReportData({
          ...reportData,
          customers: response.data
        });
      }
      
      setLoading(false);
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

  const exportReport = async () => {
    try {
      let endpoint = '';
      let params = {};
      
      if (activeTab === 'sales') {
        endpoint = '/reports/sales/export';
        params = {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        };
      } else if (activeTab === 'products') {
        endpoint = '/reports/products/export';
        params = { timeRange: productTimeRange };
      } else if (activeTab === 'customers') {
        endpoint = '/reports/customers/export';
      }
      
      // Download file từ API
      const response = await api.get(endpoint, { 
        params, 
        responseType: 'blob' 
      });
      
      // Tạo URL cho file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Xuất báo cáo thành công');
    } catch (err) {
      console.error('Error exporting report:', err);
      message.error('Không thể xuất báo cáo');
    }
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