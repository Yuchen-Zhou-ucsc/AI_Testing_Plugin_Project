import { Button, Card, Typography } from 'antd'
import { Navigate, useNavigate } from 'react-router-dom'

import './AuthPage.css'

const { Title, Text } = Typography


function WelcomePage() {
  const navigate = useNavigate()

  const savedUser = localStorage.getItem('currentUser')

  // 没有登录信息时，自动返回登录页
  if (!savedUser) {
    return <Navigate to="/login" replace />
  }

  const user = JSON.parse(savedUser)

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/login', { replace: true })
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>登录成功</Title>
          <Text type="secondary">
            欢迎回来，{user.username}
          </Text>
        </div>

        <Button
          type="primary"
          block
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Card>
    </div>
  )
}

export default WelcomePage