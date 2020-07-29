// components/myToast/myToast.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toastValue:{
      type:Object,
      value:{}
    }
  },
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //自定义信息提示弹出框
    showToast: function () {
      var that = this;
      var isShowToast = 'toastValue.isShowToast'
      // toast时间  
      that.data.toastValue.count = parseInt(that.data.toastValue.count) ? parseInt(that.data.toastValue.count) : 3000;
      // 显示toast  
      that.setData({
        [isShowToast]: true,
      });
      // 定时器关闭  
      setTimeout(function () {
        that.setData({
        [isShowToast]: false
      });
      }, that.data.toastValue.count);
  
},

  }
})
