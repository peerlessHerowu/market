// pages/orderRemark/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    max: 120, //最多字数 (根据自己需求改变) 
    currentWordNumber:0,

    value:'',

    //快捷提示
    shortcut:[],
  },

  onLoad(){

    var shortcut = []
    shortcut.push("挂门把手上")
    shortcut.push("放前台桌上")
    shortcut.push("放门口")
    shortcut.push("请电话联系我")
    this.setData({
      shortcut
    })
    var orderRemark = wx.getStorageSync("orderRemark");
    this.setData({
      value:orderRemark
    })
  },
  //字数限制  
  inputs: function (e) {
    // 获取输入框的内容
    var {value}  = e.detail;
    // 获取输入框内容的长度
    var len = parseInt(value.length);

    this.setData({
      currentWordNumber: len, //当前字数
      value  
    });
    //最多字数限制
    if (len > this.data.max) return;
   
  },
  completeInput(){

    console.log(this.data.value)
    wx.setStorageSync("orderRemark", this.data.value);
    wx.navigateBack({
      delta: 1
    });
  },

  //快捷输入
  shortcutInput(e){
    const {index} = e.currentTarget.dataset
    this.setData({
      value:this.data.shortcut[index]
    })
  },


})