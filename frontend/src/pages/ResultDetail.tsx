import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Tag, Progress, Space, Spin, Button, Alert } from 'antd'
import { ArrowLeftOutlined, RobotOutlined } from '@ant-design/icons'
import { resumeAPI } from '../services/api'
import ReactMarkdown from 'react-markdown'

const { Title, Text, Paragraph } = Typography

interface ResultData {
  id: number
  score: number
  summary: string
  optimized_text: string
  suggestions: any[]
  keyword_matches: any
  ats_feedback: string
  created_at: string
}

const ResultDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      resumeAPI.getResult(Number(id))
        .then((res) => setResult(res.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [id])

  const scoreColor = (score: number) => {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'blue'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
        <Alert type="error" message="未找到该优化记录" showIcon />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/history')}>
          返回历史记录
        </Button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/history')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回历史记录
      </Button>

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
          <Text>{result.summary}</Text>
        </Paragraph>
        <Text type="secondary">
          优化时间：{new Date(result.created_at).toLocaleString('zh-CN')}
        </Text>
      </Card>

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <Card title="优化建议" style={{ marginBottom: 24 }}>
          {result.suggestions.map((s: any, idx: number) => (
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
                </Space>
              }
            >
              <Paragraph><Text strong>问题：</Text>{s.description}</Paragraph>
              <Paragraph><Text strong>建议：</Text>{s.suggestion}</Paragraph>
            </Card>
          ))}
        </Card>
      )}

      {/* Keywords */}
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
              <Text strong>已匹配：</Text>
              <div style={{ marginTop: 4 }}>
                {result.keyword_matches.matched_keywords?.map((kw: string, idx: number) => (
                  <Tag key={idx} color="green">{kw}</Tag>
                ))}
              </div>
            </div>
            {result.keyword_matches.missing_keywords?.length > 0 && (
              <div>
                <Text strong>缺失：</Text>
                <div style={{ marginTop: 4 }}>
                  {result.keyword_matches.missing_keywords.map((kw: string, idx: number) => (
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
        <Card title="优化后的简历" style={{ marginBottom: 24 }}>
          <div className="markdown-content">
            <ReactMarkdown>{result.optimized_text}</ReactMarkdown>
          </div>
        </Card>
      )}

      <div style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          icon={<RobotOutlined />}
          onClick={() => navigate('/')}
        >
          优化新的简历
        </Button>
      </div>
    </div>
  )
}

export default ResultDetail
