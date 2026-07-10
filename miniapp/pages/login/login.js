const api = require('../../utils/api')

Page({
  data: {
    tab: 'login',
    username: '',
    password: '',
    regUsername: '',
    regEmail: '',
    regPassword: '',
    loading: false,
  },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab })
  },

  onUsernameInput(e) { this.setData({ username: e.detail.value }) },
  onPasswordInput(e) { this.setData({ password: e.detail.value }) },
  onRegUsernameInput(e) { this.setData({ regUsername: e.detail.value }) },
  onRegEmailInput(e) { this.setData({ regEmail: e.detail.value }) },
  onRegPasswordInput(e) { this.setData({ regPassword: e.detail.value }) },

  async handleLogin() {
    this.setData({ loading: true })
    try {
      const res = await api.login(this.data.username, this.data.password)
      wx.setStorageSync('token', res.access_token)
      wx.showToast({ title: '登录成功', icon: 'success' })
      wx.switchTab({ url: '/pages/upload/upload' })
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  async handleRegister() {
    this.setData({ loading: true })
    try {
      const res = await api.register(
        this.data.regUsername,
        this.data.regPassword,
        this.data.regEmail || undefined,
      )
      wx.setStorageSync('token', res.access_token)
      wx.showToast({ title: '注册成功', icon: 'success' })
      wx.switchTab({ url: '/pages/upload/upload' })
    } catch (err) {
      wx.showToast({ title: err.message || '注册失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
})
