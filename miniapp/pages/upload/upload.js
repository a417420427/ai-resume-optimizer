const api = require('../../utils/api')

Page({
  data: {
    filePath: '',
    fileName: '',
    loading: false,
    languageIndex: 0,
    toneIndex: 0,
    languages: ['中文', 'English'],
    tones: ['专业正式', '简洁有力', '创意突出'],
    targetPosition: '',
    targetIndustry: '',
    result: null,
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'docx', 'txt'],
      success: (res) => {
        const file = res.tempFiles[0]
        const ext = file.name.split('.').pop().toLowerCase()
        if (!['pdf', 'docx', 'txt'].includes(ext)) {
          wx.showToast({ title: '仅支持 PDF/DOCX/TXT', icon: 'none' })
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          wx.showToast({ title: '文件不能超过 10MB', icon: 'none' })
          return
        }
        this.setData({
          filePath: file.path,
          fileName: file.name,
        })
      },
    })
  },

  onPositionInput(e) {
    this.setData({ targetPosition: e.detail.value })
  },

  onIndustryInput(e) {
    this.setData({ targetIndustry: e.detail.value })
  },

  onLanguageChange(e) {
    this.setData({ languageIndex: e.detail.value })
  },

  onToneChange(e) {
    this.setData({ toneIndex: e.detail.value })
  },

  scoreColor(score) {
    if (score >= 80) return '#52c41a'
    if (score >= 60) return '#faad14'
    return '#ff4d4f'
  },

  async uploadResume() {
    if (!this.data.filePath || this.data.loading) return

    this.setData({ loading: true })

    try {
      const languageMap = ['zh', 'en']
      const toneMap = ['professional', 'concise', 'creative']

      const res = await api.uploadResume(this.data.filePath, {
        target_position: this.data.targetPosition,
        target_industry: this.data.targetIndustry,
        language: languageMap[this.data.languageIndex],
        tone: toneMap[this.data.toneIndex],
      })

      this.setData({
        result: res,
        loading: false,
      })

      wx.showToast({ title: '优化完成！', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: err.message || '优化失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  reset() {
    this.setData({
      filePath: '',
      fileName: '',
      result: null,
      targetPosition: '',
      targetIndustry: '',
    })
  },
})
