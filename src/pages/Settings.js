import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Tabs, Switch, Select,
  Typography, message, Divider, Row, Col, Upload
} from 'antd';
import { SaveOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSaveGeneral = (values) => {
    setLoading(true);
    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setLoading(false);
      message.success('Cài đặt đã được lưu thành công');
    }, 1000);
  };

  const handleSaveAccount = (values) => {
    setLoading(true);
    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setLoading(false);
      message.success('Thông tin tài khoản đã được cập nhật');
    }, 1000);
  };

  const handleChangePassword = (values) => {
    setLoading(true);
    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setLoading(false);
      message.success('Mật khẩu đã được thay đổi thành công');
    }, 1000);
  };

  return (
    <div>
      <Title level={2}>Cài đặt</Title>
      
      <Tabs defaultActiveKey="general">
        <TabPane tab="Cài đặt chung" key="general">
          <Card>
            <Form
              layout="vertical"
              onFinish={handleSaveGeneral}
              initialValues={{
                storeName: 'Snack Shop',
                email: 'contact@snackshop.com',
                phone: '0123456789',
                address: '123 Đường ABC, Quận XYZ, TP.HCM',
                currency: 'VND',
                language: 'vi',
                enableNotifications: true
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="storeName"
                    label="Tên cửa hàng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email liên hệ"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="currency"
                    label="Đơn vị tiền tệ"
                    rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ' }]}
                  >
                    <Select>
                      <Option value="VND">VND (₫)</Option>
                      <Option value="USD">USD ($)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Ngôn ngữ"
                    rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
                  >
                    <Select>
                      <Option value="vi">Tiếng Việt</Option>
                      <Option value="en">Tiếng Anh</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enableNotifications"
                    label="Bật thông báo"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Lưu cài đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Tài khoản" key="account">
          <Card>
            <Form
              layout="vertical"
              onFinish={handleSaveAccount}
              initialValues={{
                name: 'Admin',
                email: 'admin@snackshop.com',
                phone: '0987654321'
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                  >
                    <div style={{ marginTop: 8 }}>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  </Upload>
                </Col>
                <Col span={16}>
                  <Form.Item
                    name="name"
                    label="Họ tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
            
            <Divider />
            
            <Title level={4}>Thay đổi mật khẩu</Title>
            <Form
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 kí tự' }
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;