import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import GenerateTestsPage from './pages/GenerateTestsPage.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 打开首页时自动进入登录页 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 登录页面 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 注册页面 */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 登录成功后的欢迎页面 */}
        <Route path="/welcome" element={<WelcomePage />} />

        {/* AI 测试用例生成页面 */}
        <Route path="/generate-tests" element={<GenerateTestsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App