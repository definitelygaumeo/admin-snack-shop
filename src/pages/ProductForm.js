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
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      message.error('Không thể tải danh mục sản phẩm');
    }
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/snacks/${id}`);
      const productData = response.data;
      
      form.setFieldsValue({
        name: productData.snackName,
        price: productData.price,
        category: productData.categoryId,
        stock: productData.stock,
        description: productData.description,
        discount: productData.discount || 0,
        status: productData.stock > 0,
      });
      
      if (productData.images && productData.images.length > 0) {
        setImageUrl(productData.images[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product details:', err);
      message.error('Không thể tải thông tin sản phẩm');
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Prepare data to match backend model
      const productData = {
        snackName: values.name,
        description: values.description,
        price: values.price,
        stock: values.stock,
        categoryId: values.category,
        discount: values.discount || 0,
        images: imageUrl ? [imageUrl] : []
      };
      
      if (isEditing) {
        await api.put(`/snacks/${id}`, productData);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await api.post('/snacks', productData);
        message.success('Thêm sản phẩm thành công');
      }
      
      navigate('/products');
    } catch (err) {
      console.error('Error saving product:', err);
      message.error('Không thể lưu sản phẩm: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setImageUrl(response.data.url);
      onSuccess('ok');
      message.success('Tải ảnh lên thành công');
    } catch (err) {
      console.error('Error uploading image:', err);
      onError('Tải ảnh lên thất bại');
      message.error('Tải ảnh lên thất bại');
    }
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

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="discount"
                    label="Giảm giá (%)"
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="Nhập % giảm giá" />
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
                    customRequest={handleImageUpload}
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