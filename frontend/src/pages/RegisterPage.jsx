import { useState } from 'react'

import axios from 'axios'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

import './AuthPage.css'

const { Title, Text } = Typography


function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (values) => {
    setLoading(true)

    try {
      const response = await axios.post('/api/register', {
        username: values.username,
        password: values.password,
      })

      message.success(response.data.message)
      navigate('/login')
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || '注册失败，请稍后重试'

      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>用户注册</Title>
          <Text type="secondary">
            创建一个新的用户账号
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleRegister}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              {
                required: true,
                message: '请输入用户名',
              },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}
          >
            <Input.Password
              placeholder="请输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          已经有账号？<Link to="/login">返回登录</Link>
        </div>
      </Card>
    </div>
  )
}

export default RegisterPage