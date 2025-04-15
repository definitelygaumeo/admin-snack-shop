import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tag, Typography, 
  DatePicker, Select, message
} from 'antd';
import { 
  SearchOutlined, EyeOutlined, FileExcelOutlined,
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import api from '../services/api'; // Thêm import api

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchText, dateRange, statusFilter, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      // Transform data to match the expected format in component
      const formattedOrders = response.data.map(order => ({
        id: order._id,
        customer: order.userName || 'Khách hàng',
        phone: order.phoneNumber || 'N/A',
        date: order.createdAt,
        total: order.finalTotal || order.total,
        status: order.status.toLowerCase(),
        items: order.items.length
      }));
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      message.error('Không thể tải danh sách đơn hàng');
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    if (searchText) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchText.toLowerCase()) ||
        order.phone.includes(searchText)
      );
    }
    
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(order => {
        const orderDate = moment(order.date);
        return orderDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }
    
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleViewOrder = (id) => {
    navigate(`/orders/${id}`);
  };

  const resetFilters = () => {
    setSearchText('');
    setDateRange(null);
    setStatusFilter(null);
  };

  const exportToExcel = () => {
    message.success('Xuất file Excel thành công');
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Số SP',
      dataIndex: 'items',
      key: 'items',
      align: 'center',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: total => `${total.toLocaleString()}đ`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'green';
        let text = 'Hoàn thành';
        
        if (status === 'pending') {
          color = 'gold';
          text = 'Chờ xử lý';
        } else if (status === 'processing') {
          color = 'blue';
          text = 'Đang xử lý';
        } else if (status === 'cancelled') {
          color = 'red';
          text = 'Đã hủy';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewOrder(record.id)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>{t('orders')}</Title>
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />} 
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
        </div>
        
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <Input
            placeholder="Tìm kiếm theo mã, tên KH, SĐT"
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <RangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Select
            style={{ width: 150 }}
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={handleStatusFilter}
            allowClear
          >
            <Option value="pending">Chờ xử lý</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={resetFilters}
          >
            Đặt lại
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};

export default Orders;