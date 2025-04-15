import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tag, Image, Popconfirm, 
  Typography, message, Select, Tooltip
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchText, selectedCategory, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/snacks');
      // Transform data to match the expected format in component
      const formattedProducts = response.data.map(snack => ({
        id: snack._id,
        name: snack.snackName,
        price: snack.price,
        realPrice: snack.realPrice,
        image: snack.images && snack.images.length > 0 ? snack.images[0] : 'https://via.placeholder.com/80',
        category: snack.categoryId,
        stock: snack.stock,
        status: snack.stock > 0 ? 'active' : 'inactive',
        description: snack.description,
        discount: snack.discount
      }));
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      message.error('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Danh sách category cố định từ model
      const categoriesMap = {
        'banh': 'Bánh',
        'keo': 'Kẹo',
        'do_kho': 'Đồ khô',
        'mut': 'Mứt',
        'hat': 'Hạt'
      };
      setCategories(Object.keys(categoriesMap));
    } catch (err) {
      console.error('Error fetching categories:', err);
      message.error('Không thể tải danh mục sản phẩm');
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    if (searchText) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleCategoryFilter = (value) => {
    setSelectedCategory(value);
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/snacks/${id}`);
      message.success('Xóa sản phẩm thành công');
      fetchProducts(); // Tải lại danh sách sau khi xóa
    } catch (err) {
      console.error('Error deleting product:', err);
      message.error('Không thể xóa sản phẩm: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: image => <Image src={image} alt="Product" width={50} height={50} />,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <div>
          {record.discount > 0 ? (
            <>
              <div style={{ textDecoration: 'line-through', color: '#999' }}>{price.toLocaleString()}đ</div>
              <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{record.realPrice.toLocaleString()}đ</div>
              <Tag color="red">-{record.discount}%</Tag>
            </>
          ) : (
            `${price.toLocaleString()}đ`
          )}
        </div>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(category => ({ text: category, value: category })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
      render: stock => {
        let color = 'green';
        if (stock <= 10) {
          color = 'red';
        } else if (stock <= 20) {
          color = 'orange';
        }
        return <Tag color={color}>{stock}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        return (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? 'Hoạt động' : 'Ngừng bán'}
          </Tag>
        );
      },
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Ngừng bán', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditProduct(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sản phẩm này?"
              onConfirm={() => handleDeleteProduct(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} size="small" />
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
          <Title level={2}>{t('product_list')}</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddProduct}
          >
            Thêm sản phẩm
          </Button>
        </div>
        
        <div style={{ marginBottom: 16, display: 'flex', gap: '10px' }}>
          <Input
            placeholder="Tìm kiếm sản phẩm"
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo danh mục"
            value={selectedCategory}
            onChange={handleCategoryFilter}
            allowClear
          >
            {categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
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
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};

export default Products;