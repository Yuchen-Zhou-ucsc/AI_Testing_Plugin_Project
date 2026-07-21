import { useState } from 'react'

import axios from 'axios'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

import './AuthPage.css'

const { Title, Text } = Typography


function LoginPage() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (values) => {
        setLoading(true)

        try {
            const response = await axios.post('/api/login', {
                username: values.username,
                password: values.password,
            })

            localStorage.setItem(
                'currentUser',
                JSON.stringify(response.data.user)
            )

            message.success(
                `${response.data.message}，欢迎 ${response.data.user.username}`
            )

            navigate('/welcome')
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || '登录失败，请稍后重试'

            message.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <div className="auth-header">
                    <Title level={2}>用户登录</Title>
                    <Text type="secondary">
                        请输入用户名和密码
                    </Text>
                </div>

                <Form
                    layout="vertical"
                    onFinish={handleLogin}
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
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>

                <div className="auth-footer">
                    还没有账号？<Link to="/register">立即注册</Link>
                </div>
            </Card>
        </div>
    )
}

export default LoginPage