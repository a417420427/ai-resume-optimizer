const api = require('../../utils/api')

Page({
  data: {
    list: [],
    loading: true,
  },

  onShow() {
    this.loadHistory()
  },

  async loadHistory() {
    this.setData({ loading: true })
    try {
      const data = await api.getHistory()
      this.setData({ list: data })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  viewResult(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/result/result?id=' + id,
    })
  },

  goUpload() {
    wx.switchTab({ url: '/pages/upload/upload' })
  },
})
