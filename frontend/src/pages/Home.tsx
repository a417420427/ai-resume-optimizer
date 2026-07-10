import React, { useState, useEffect } from 'react'
import { Upload, Button, Form, Select, Input, Card, Typography, Space, Tag, message, Progress, Steps, Alert, Row, Col } from 'antd'
import { UploadOutlined, RobotOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { resumeAPI } from '../services/api'
import type { OptimizationResult } from '../types'
import ReactMarkdown from 'react-markdown'

const { Title, Text, Paragraph } = Typography

const cls_download = (id: number, fmt: string, template: string) => {
  const token = localStorage.getItem('token')
  message.loading({ content: '生成中...', key: 'download' })
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
    message.success({ content: `${fmt.toUpperCase()} 已下载`, key: 'download' })
  })
  .catch(() => message.error({ content: '下载失败', key: 'download' }))
}

const ResumeUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [templates, setTemplates] = useState<{key: string; name: string}[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [form] = Form.useForm()

  useEffect(() => {
    // Fetch available templates
    fetch('/api/v1/resume/templates')
      .then(r => r.json())
      .then(setTemplates)
      .catch(() => {})
  }, [])

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('请先上传简历')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('target_position', form.getFieldValue('target_position') || '')
    formData.append('target_industry', form.getFieldValue('target_industry') || '')
    formData.append('language', form.getFieldValue('language') || 'zh')
    formData.append('tone', form.getFieldValue('tone') || 'professional')

    try {
      const res = await resumeAPI.upload(formData)
      setResult(res.data)
      message.success('简历优化完成！')
    } catch (err: any) {
      const detail = err.response?.data?.detail || '上传失败'
      message.error(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange: UploadProps['onChange'] = (info) => {
    const file = info.fileList[0]?.originFileObj
    if (file) {
      setSelectedFile(file as File)
    }
  }

  const uploadProps: UploadProps = {
    onRemove: () => setSelectedFile(null),
    beforeUpload: (file) => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
      if (!['.pdf', '.docx', '.txt'].includes(ext)) {
        message.error('仅支持 PDF、DOCX、TXT 格式')
        return Upload.LIST_IGNORE
      }
      if (file.size > 10 * 1024 * 1024) {
        message.error('文件不能超过 10MB')
        return Upload.LIST_IGNORE
      }
      setSelectedFile(file)
      return false
    },
    onChange: handleFileChange,
    fileList: selectedFile ? [{ uid: '-1', name: selectedFile.name, status: 'done' } as UploadFile] : [],
    maxCount: 1,
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'blue'
      default: return 'default'
    }
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2}>
          <RobotOutlined style={{ marginRight: 12 }} />
          AI 简历优化
        </Title>
        <Text type="secondary">
          上传简历，AI 智能分析 ATS 评分并给出优化建议，帮你通过第一轮筛选
        </Text>
      </div>

      {/* Upload Section */}
      {!result && (
        <Card style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical">
            <Form.Item label="上传简历文件" required>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: 12 }}>
                支持 PDF、DOCX、TXT 格式，最大 10MB
              </Text>
            </Form.Item>

            <Space size="large" wrap>
              <Form.Item name="target_position" label="目标职位">
                <Input placeholder="如：后端开发工程师" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="target_industry" label="目标行业">
                <Input placeholder="如：互联网/金融" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="language" label="语言" initialValue="zh">
                <Select style={{ width: 120 }}>
                  <Select.Option value="zh">中文</Select.Option>
                  <Select.Option value="en">English</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="tone" label="风格" initialValue="professional">
                <Select style={{ width: 140 }}>
                  <Select.Option value="professional">专业正式</Select.Option>
                  <Select.Option value="concise">简洁有力</Select.Option>
                  <Select.Option value="creative">创意突出</Select.Option>
                </Select>
              </Form.Item>
            </Space>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                icon={<RobotOutlined />}
                onClick={handleUpload}
                loading={loading}
              >
                {loading ? 'AI 正在分析简历...' : '开始 AI 优化'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Result Section */}
      {result && (
        <>
          {/* Score */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Title level={4}>ATS 兼容性评分</Title>
            <Progress
              type="dashboard"
              percent={result.score}
              strokeColor={scoreColor(result.score)}
              format={(p) => `${p}分`}
            />
            <Paragraph style={{ marginTop: 16 }}>
              <Text>
                {result.summary}
              </Text>
            </Paragraph>

            {/* Free tier info */}
            <Alert
              type="info"
              showIcon
              message={`免费用户已使用 ${result.optimize_count} / ${result.free_tier_limit} 次优化`}
              action={
                <Button size="small" type="primary" disabled>
                  升级 VIP
                </Button>
              }
            />
          </Card>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card title="优化建议" style={{ marginBottom: 24 }}>
              {result.suggestions.map((s, idx) => (
                <Card
                  key={idx}
                  size="small"
                  style={{ marginBottom: 12 }}
                  type="inner"
                  title={
                    <Space>
                      <Tag color={severityColor(s.severity)}>
                        {s.severity === 'high' ? '重要' : s.severity === 'medium' ? '中等' : '建议'}
                      </Tag>
                      {s.title}
                      <Tag>{s.type === 'content' ? '内容' : s.type === 'format' ? '格式' : s.type === 'keyword' ? '关键词' : 'ATS'}</Tag>
                    </Space>
                  }
                >
                  <Paragraph><Text strong>问题：</Text>{s.description}</Paragraph>
                  <Paragraph><Text strong>建议：</Text>{s.suggestion}</Paragraph>
                </Card>
              ))}
            </Card>
          )}

          {/* Keyword Analysis */}
          {result.keyword_matches && (
            <Card title="关键词分析" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>
                  <Text strong>关键词覆盖率：</Text>
                  <Progress
                    percent={Math.round(result.keyword_matches.keyword_density)}
                    size="small"
                    strokeColor={scoreColor(result.keyword_matches.keyword_density)}
                  />
                </Text>

                <div>
                  <Text strong>已匹配的关键词：</Text>
                  <div style={{ marginTop: 4 }}>
                    {result.keyword_matches.matched_keywords.map((kw, idx) => (
                      <Tag key={idx} color="green">{kw}</Tag>
                    ))}
                  </div>
                </div>

                {result.keyword_matches.missing_keywords.length > 0 && (
                  <div>
                    <Text strong>缺失的关键词：</Text>
                    <div style={{ marginTop: 4 }}>
                      {result.keyword_matches.missing_keywords.map((kw, idx) => (
                        <Tag key={idx} color="red">{kw}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {/* ATS Feedback */}
          {result.ats_feedback && (
            <Card title="ATS 系统建议" style={{ marginBottom: 24 }}>
              <Paragraph>{result.ats_feedback}</Paragraph>
            </Card>
          )}

          {/* Optimized Resume */}
          {result.optimized_text && (
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  优化后的简历
                  <Select
                    value={selectedTemplate}
                    onChange={setSelectedTemplate}
                    size="small"
                    style={{ width: 120 }}
                    options={templates.map(t => ({ label: t.name, value: t.key }))}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => cls_download(result.optimization_id, 'docx', selectedTemplate)}
                  >
                    DOCX
                  </Button>
                  <Button
                    size="small"
                    icon={<FileTextOutlined />}
                    onClick={() => cls_download(result.optimization_id, 'pdf', selectedTemplate)}
                  >
                    PDF
                  </Button>
                </Space>
              }
            >
              <div className="markdown-content">
                <ReactMarkdown>{result.optimized_text}</ReactMarkdown>
              </div>
            </Card>
          )}

          {/* New Analysis Button */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={() => {
                setResult(null)
                setSelectedFile(null)
                form.resetFields()
              }}
            >
              分析新的简历
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default ResumeUploader
