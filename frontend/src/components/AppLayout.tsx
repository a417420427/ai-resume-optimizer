import React from 'react'
import { Layout, Menu, Button, Typography, Space } from 'antd'
import { UploadOutlined, HistoryOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Header, Content } = Layout
const { Text } = Typography

const AppLayout: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textDecoration: 'none' }}>
            📄 AI 简历优化
          </Link>
          {isLoggedIn && (
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['upload']}
              items={[
                { key: 'upload', icon: <UploadOutlined />, label: '简历优化', onClick: () => navigate('/') },
                { key: 'history', icon: <HistoryOutlined />, label: '历史记录', onClick: () => navigate('/history') },
              ]}
              style={{ flex: 1, minWidth: 200 }}
            />
          )}
        </div>

        <Space>
          {isLoggedIn ? (
            <>
              <Text style={{ color: '#fff' }}>
                <UserOutlined /> {user?.username}
                {user?.is_vip && <span style={{ color: '#fadb14', marginLeft: 4 }}>VIP</span>}
              </Text>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={logout}
                style={{ color: '#fff' }}
              >
                退出
              </Button>
            </>
          ) : (
            <Button type="primary" ghost onClick={() => navigate('/login')}>
              登录 / 注册
            </Button>
          )}
        </Space>
      </Header>

      <Content>
        <Outlet />
      </Content>
    </Layout>
  )
}

export default AppLayout
