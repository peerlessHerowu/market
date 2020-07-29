// pages/pay/index.js
const regeneratorRuntime = require('../../utils/runtime.js')
var formatDate = require('../../utils/formatDate.js')
var getIdUtil = require('../../utils/getId.js')
var orderNumberUtil = require('../../utils/randomOrderNumber.js')
var floatObj = require('../../utils/operateFloat.js')

const DB = wx.cloud.database();

//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    orderDetail:{},
    totalPrice:0
  },

  index:0,
  async onLoad(options){
    const {index} = options
    this.index = index
    let orderDetail = wx.getStorageSync("goods_orders").data[index];

    console.log(orderDetail)
    let totalPrice = 0
    let theOrder = orderDetail.theOrder
    theOrder.forEach(element => {
      totalPrice = floatObj.add(totalPrice,element.goods_price,2)
    });
    console.log(orderDetail)
    this.setData({
      orderDetail,
      totalPrice
    })

   
  },

  //复制到剪贴板
  copyToClickboard(e){
    console.log(this.data.orderDetail.orderNumber)
    wx.setClipboardData({
      data: this.data.orderDetail.orderNumber,
      success: (result)=>{
        wx.showToast({
          title: '复制成功',
          icon: 'success',
        });
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },

  contactMarket(){
    wx.makePhoneCall({
      phoneNumber: app.globalData.phoneNumber,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  handleModifyOrder(){
    wx.setStorageSync("fromLackGoods",{orderNumber:this.data.orderDetail.orderNumber,index:this.index});
    wx.switchTab({
      url: '/pages/category/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },



  /**
   * 生命周期函数--监听页面加载
   */


  onShow: function (e) {
    
  },



})