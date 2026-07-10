const app = getApp()

const BASE_URL = 'https://your-api-domain.com/api/v1'

function request(url, method = 'GET', data = {}, header = {}) {
  const token = wx.getStorageSync('token')
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': method === 'POST' && !header['Content-Type']
          ? 'application/json'
          : 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header,
      },
      success(res) {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.navigateTo({ url: '/pages/index/index' })
          reject(new Error('登录已过期'))
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(res.data?.detail || '请求失败'))
        }
      },
      fail(err) {
        reject(new Error('网络错误'))
      },
    })
  })
}

// Auth
function login(username, password) {
  return request('/auth/login', 'POST', { username, password })
}

function register(username, password, email) {
  return request('/auth/register', 'POST', { username, password, email })
}

// Resume
function uploadResume(filePath, formData) {
  const token = wx.getStorageSync('token')
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/resume/upload`,
      filePath,
      name: 'file',
      formData: {
        target_position: formData.target_position || '',
        target_industry: formData.target_industry || '',
        language: formData.language || 'zh',
        tone: formData.tone || 'professional',
      },
      header: {
        Authorization: `Bearer ${token}`,
      },
      success(res) {
        try {
          resolve(JSON.parse(res.data))
        } catch {
          reject(new Error('响应解析失败'))
        }
      },
      fail(err) {
        reject(new Error('上传失败'))
      },
    })
  })
}

function getHistory() {
  return request('/resume/history')
}

function getResult(id) {
  return request(`/resume/result/${id}`)
}

module.exports = {
  login,
  register,
  uploadResume,
  getHistory,
  getResult,
}
