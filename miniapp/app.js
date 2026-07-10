App({
  globalData: {
    token: null,
    userInfo: null,
    baseUrl: 'https://your-api-domain.com/api/v1',
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
    }
  },
})
