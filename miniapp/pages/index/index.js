const app = getApp()

Page({
  data: {
    token: '',
  },

  onShow() {
    this.setData({
      token: wx.getStorageSync('token') || '',
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/index/index?tab=register' })
  },

  goUpload() {
    wx.switchTab({ url: '/pages/upload/upload' })
  },
})
