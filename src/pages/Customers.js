import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tag, Avatar, 
  Typography, message, Select, Modal, Form, Tooltip, Switch,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, SearchOutlined, PlusOutlined, 
  EditOutlined, DeleteOutlined, MailOutlined,
  PhoneOutlined, EnvironmentOutlined, ReloadOutlined,
  EyeOutlined, FileExcelOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const { Title } = Typography;

const Customers = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchText, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        const mockCustomers = [
          { 
            id: 1, 
            name: 'Nguyễn Văn A', 
            email: 'nguyenvana@example.com',
            phone: '0901234567',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            totalOrders: 5,
            totalSpent: 875000,
            createdAt: '2025-01-15',
            status: 'active'
          },
          { 
            id: 2, 
            name: 'Trần Thị B', 
            email: 'trantb@example.com',
            phone: '0912345678',
            address: '456 Lê Lợi, Quận 3, TP.HCM',
            totalOrders: 3,
            totalSpent: 425000,
            createdAt: '2025-02-20',
            status: 'active'
          },
          { 
            id: 3, 
            name: 'Lê Văn C', 
            email: 'levc@example.com',
            phone: '0823456789',
            address: '789 Cách Mạng Tháng 8, Quận Tân Bình, TP.HCM',
            totalOrders: 2,
            totalSpent: 325000,
            createdAt: '2025-03-10',
            status: 'inactive'
          },
          { 
            id: 4, 
            name: 'Phạm Thị D', 
            email: 'phamtd@example.com',
            phone: '0934567890',
            address: '101 Hai Bà Trưng, Quận 1, TP.HCM',
            totalOrders: 4,
            totalSpent: 520000,
            createdAt: '2025-02-05',
            status: 'active'
          },
          { 
            id: 5, 
            name: 'Hoàng Văn E', 
            email: 'hoangve@example.com',
            phone: '0845678901',
            address: '202 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
            totalOrders: 1,
            totalSpent: 195000,
            createdAt: '2025-04-01',
            status: 'active'
          },
        ];
        setCustomers(mockCustomers);
        setFilteredCustomers(mockCustomers);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching customers:', err);
      message.error('Không thể tải danh sách khách hàng');
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];
    
    if (searchText) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone.includes(searchText)
      );
    }
    
    setFilteredCustomers(filtered);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const exportToExcel = () => {
    message.success('Xuất file Excel thành công');
  };

  const handleAddCustomer = () => {
    setCurrentCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status === 'active'
    });
    setIsModalVisible(true);
  };

  const handleDeleteCustomer = async (id) => {
    try {
      // In real app, call API to delete customer
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
      message.success('Xóa khách hàng thành công');
    } catch (err) {
      console.error('Error deleting customer:', err);
      message.error('Không thể xóa khách hàng');
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (currentCustomer) {
        // Update existing customer
        const updatedCustomers = customers.map(customer => {
          if (customer.id === currentCustomer.id) {
            return {
              ...customer,
              name: values.name,
              email: values.email,
              phone: values.phone,
              address: values.address,
              status: values.status ? 'active' : 'inactive'
            };
          }
          return customer;
        });
        setCustomers(updatedCustomers);
        message.success('Cập nhật khách hàng thành công');
      } else {
        // Add new customer
        const newCustomer = {
          id: customers.length + 1,
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          totalOrders: 0,
          totalSpent: 0,
          createdAt: moment().format('YYYY-MM-DD'),
          status: values.status ? 'active' : 'inactive'
        };
        setCustomers([...customers, newCustomer]);
        message.success('Thêm khách hàng thành công');
      }
      setIsModalVisible(false);
    });
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              <MailOutlined style={{ marginRight: 4 }} />{record.email}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              <PhoneOutlined style={{ marginRight: 4 }} />{record.phone}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      align: 'center',
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: totalSpent => `${totalSpent.toLocaleString()}đ`,
      sorter: (a, b) => a.totalSpent - b.totalSpent,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="primary" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditCustomer(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa khách hàng này?"
              onConfirm={() => handleDeleteCustomer(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="default" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2}>{t('customers')}</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddCustomer}
            >
              Thêm khách hàng
            </Button>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={exportToExcel}
            >
              Xuất Excel
            </Button>
          </Space>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại"
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={currentCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" defaultChecked />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Customers;