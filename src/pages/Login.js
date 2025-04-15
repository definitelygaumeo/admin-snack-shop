import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const { Title } = Typography;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const success = await login(values.username, values.password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Snack Shop Admin</Title>
          <Title level={4}>{t('login')}</Title>
        </div>
        
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        <Spin spinning={loading}>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: `${t('username')} ${t('is_required')}` }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('username')} />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: `${t('password')} ${t('is_required')}` }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('password')} />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                {t('login')}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;