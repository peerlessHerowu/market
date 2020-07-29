/**
 * 使用方法：
 * json:"top-refresh": "/components/top-refresh/top-refresh"
 * wxml:<top-refresh id='tfresh'></top-refresh>
 * js: 
 * --------------------------------------------
    const com = that.selectComponent('#tfresh')
    // 控制是否正在刷新
    if (com.data.toprefresh) {
      return
    }
    // 启动刷新动画
    com.refreshstart()
    // 停止刷新动画
    com.refreshend()
 * --------------------------------------------
 */

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    toprefresh: false,
    timestamp: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

    refreshstart() {
      let that = this
      that.setData({
        toprefresh: true
      })
      // 弹出动画
      that.animation = wx.createAnimation({
        duration: 0,
        timingFunction: 'step-start',
      })
      that.animation.opacity(0).height(0).step()
      that.setData({
        animation: that.animation.export()
      }, function () {
        that.animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease',
        })
        that.animation.opacity(1).height(44).step()
        setTimeout(function () {
          that.setData({
            animation: that.animation.export()
          })
        }, 100)
      })

      var myDate = new Date();//获取系统当前时间
      that.setData({
        timestamp: myDate.getSeconds()
      })

    },

    refreshend() {
      let duration = 1.5 // 动画最短时长
      var myDate = new Date()
      const second = myDate.getSeconds()
      if ((second - this.data.timestamp) < duration) {
        this.endImd(duration - (second - this.data.timestamp))
      } else {
        this.endImd(0)
      }
    },

    endImd(time) {
      let that = this
      setTimeout(function () {
        that.animation = wx.createAnimation({
          duration: 300,
          timingFunction: 'ease',
        })
        that.animation.opacity(0).height(0).step()
        that.setData({
          animation: that.animation.export()
        })
        setTimeout(function () {
          that.setData({
            toprefresh: false
          })
        }, 300)
      }, time * 1000)
    }

  }
})