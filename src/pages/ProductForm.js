import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, InputNumber, Switch, 
  Upload, Card, Typography, message, Spin, Row, Col
} from 'antd';
import { 
  UploadOutlined, SaveOutlined, RollbackOutlined, PlusOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    
    if (isEditing) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      // Use this for actual API integration
      // const response = await api.get('/categories');
      // setCategories(response.data);
      
      // Mock data for demonstration
      setCategories(['Bánh ngọt', 'Đồ ăn mặn', 'Đồ uống', 'Bánh mì']);
    } catch (err) {
      console.error('Error fetching categories:', err);
      message.error('Không thể tải danh mục sản phẩm');
    }
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // Use this for actual API integration
      // const response = await api.get(`/products/${id}`);
      // const productData = response.data;
      
      // Mock data for demonstration
      setTimeout(() => {
        const productData = {
          id: id,
          name: 'Bánh quy socola',
          price: 25000,
          category: 'Bánh ngọt',
          stock: 35,
          description: 'Bánh quy socola thơm ngon, giòn tan',
          status: true,
          image: 'https://via.placeholder.com/300',
        };
        
        form.setFieldsValue({
          name: productData.name,
          price: productData.price,
          category: productData.category,
          stock: productData.stock,
          description: productData.description,
          status: productData.status,
        });
        
        setImageUrl(productData.image);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching product details:', err);
      message.error('Không thể tải thông tin sản phẩm');
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Prepare data
      const productData = {
        ...values,
        image: imageUrl || 'https://via.placeholder.com/300', // Default image if none is uploaded
      };
      
      if (isEditing) {
        // Use this for actual API integration
        // await api.put(`/products/${id}`, productData);
        
        // Mock implementation
        console.log('Updating product', id, productData);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        // Use this for actual API integration
        // await api.post('/products', productData);
        
        // Mock implementation
        console.log('Creating product', productData);
        message.success('Thêm sản phẩm thành công');
      }
      
      navigate('/products');
    } catch (err) {
      console.error('Error saving product:', err);
      message.error('Không thể lưu sản phẩm');
      setLoading(false);
    }
  };

  const handleImageUpload = (info) => {
    if (info.file.status === 'done') {
      // When using actual API
      // setImageUrl(info.file.response.url);
      
      // Mock implementation
      getBase64(info.file.originFileObj, url => {
        setImageUrl(url);
      });
      message.success('Tải ảnh lên thành công');
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh lên thất bại');
    }
  };

  // Helper function to convert file to base64
  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(file);
  };

  // Mock implementation for file upload
  const customUploadRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <Spin spinning={loading}>
      <Card>
        <Title level={2}>
          {isEditing ? t('edit_product') : t('add_product')}
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: true,
          }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Giá (VNĐ)"
                    rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm' }]}
                  >
                    <InputNumber 
                      min={0}
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Nhập giá"
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="category"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select placeholder="Chọn danh mục">
                      {categories.map(category => (
                        <Option key={category} value={category}>{category}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="stock"
                    label="Tồn kho"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Mô tả"
              >
                <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
              </Form.Item>
              
              <Form.Item
                name="status"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng bán" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                label="Hình ảnh sản phẩm"
                name="image"
              >
                <div style={{ textAlign: 'center' }}>
                  {imageUrl && <img src={imageUrl} alt="Product" style={{ width: '100%', marginBottom: 8 }} />}
                  <Upload
                    listType="picture"
                    showUploadList={false}
                    customRequest={customUploadRequest}
                    onChange={handleImageUpload}
                  >
                    <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button onClick={handleCancel} icon={<RollbackOutlined />}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {isEditing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};

export default ProductForm;