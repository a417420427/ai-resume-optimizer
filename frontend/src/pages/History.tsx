import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Typography, Button, Space, Select, message } from 'antd'
import { ClockCircleOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import type { ResumeHistoryItem } from '../types'

const { Title } = Typography

const cls_download = (id: number, fmt: string, template: string) => {
  const token = localStorage.getItem('token')
  message.loading({ content: '生成中...', key: `dl-${id}` })
  fetch(`/api/v1/resume/download/${id}?fmt=${fmt}&template=${template}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => {
    if (!res.ok) throw new Error('下载失败')
    return res.blob()
  })
  .then(blob => {
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `optimized-resume.${fmt}`
    link.click()
    URL.revokeObjectURL(blobUrl)
    message.success({ content: `${fmt.toUpperCase()} 已下载`, key: `dl-${id}` })
  })
  .catch(() => message.error({ content: '下载失败', key: `dl-${id}` }))
}

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<ResumeHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<{key: string; name: string}[]>([])
  const [templateMap, setTemplateMap] = useState<Record<number, string>>({})
  const navigate = useNavigate()

  useEffect(() => {
    resumeAPI.getHistory()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch('/api/v1/resume/templates')
      .then(r => r.json())
      .then(setTemplates)
      .catch(() => {})
  }, [])

  const setRowTemplate = (id: number, tmpl: string) => {
    setTemplateMap(prev => ({ ...prev, [id]: tmpl }))
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'original_filename',
      key: 'filename',
    },
    {
      title: '格式',
      dataIndex: 'file_type',
      key: 'type',
      render: (type: string) => (
        <Tag>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'time',
      render: (t: string) => new Date(t).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 380,
      render: (_: any, record: ResumeHistoryItem) => {
        const optId = record.optimization_id
        const tmpl = templateMap[optId ?? 0] || 'modern'
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              disabled={!optId}
              onClick={() => navigate(`/result/${optId}`)}
            >
              {optId ? '查看' : '无结果'}
            </Button>
            {optId && (
              <>
                <Select
                  value={tmpl}
                  onChange={(v) => setRowTemplate(optId, v)}
                  size="small"
                  style={{ width: 90 }}
                  options={templates.map(t => ({ label: t.name, value: t.key }))}
                />
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => cls_download(optId, 'docx', tmpl)}
                  title="下载 DOCX"
                />
                <Button
                  size="small"
                  icon={<FileTextOutlined />}
                  onClick={() => cls_download(optId, 'pdf', tmpl)}
                  title="下载 PDF"
                />
              </>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 16px' }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>优化历史</Title>
        </Space>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default HistoryPage
