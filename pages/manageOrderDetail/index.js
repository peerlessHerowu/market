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
    totalPrice:0,
    totalCredit:0,
    currentIndex:0,
    currentI:0,
    freight:0,

    //是否显示缺货提示,是否没缺货
    noLack:[]
  },

  async onLoad(options){
    console.log(options)

    const {index} = options
    const {id} = options
    console.log(id)
    let orderDetail = wx.getStorageSync("theOrder")[index];

    var len = orderDetail.theOrder.length
    console.log('len',len)
    for (let i = 0; i < len; i++) {
      var noLack = "noLack["+ i +"]"
      console.log('status---',orderDetail.theOrder[i].status)
      if(orderDetail.theOrder[i].orderStatus === 2){
        this.setData({
          [noLack]:false 
        })
      }else if(orderDetail.theOrder[i].orderStatus === 1 || orderDetail.theOrder[i].orderStatus===3){
        this.setData({
          [noLack]:true 
        })
      }
  
    }
    let theOrder = orderDetail.theOrder
    let totalPrice = orderDetail.freight
    let totalCredit = 0
    theOrder.forEach(element => {
      if(element.status === 0){
        totalPrice=floatObj.add(totalPrice,element.goods_price,2)
      }else{
        totalCredit=floatObj.add(totalCredit,element.goods_price,2);
        this.setData({
          isGeneration:false
        })
      }
    });
    console.log(orderDetail)
    this.setData({
      orderDetail,
      totalCredit,
      totalPrice,
      currentIndex:index,
      freight:orderDetail.freight
    })

   
  },

  //点击其他地方这行组件弹回
  tap: function() {
    const currentIndex = this.data.currentIndex

    var x = "orderDetail.theOrder[" + currentIndex + "].x";

    this.setData({
       [x]:0
    })
  },
    

  havedPush : false,

  lackGoods(e){

    let that = this
  
    const {index} =  e.currentTarget.dataset
    this.setData({
      currentI:index
    })

   wx.showModal({
     title: '提示',
     content: '确定将该商品标记为缺货吗？',
     success: (result) => {
       if(result.confirm){
         var noLack = "noLack["+that.data.currentI+"]"
        this.setData({
          [noLack]: false
        })
        this.tap()
        const {index} = e.currentTarget.dataset
        wx.cloud.callFunction({
          name:'updateGoodDetailById',
          data:{
            goods_id:that.data.orderDetail.theOrder[index].goods_id,
            goods_num:0
          }
        }).then(res=>{
          console.log(res)
         
        })

        console.log(that.data.orderDetail.orderNumber)
        wx.cloud.callFunction({
          name:'updateUserOrder',
          data:{
            // _id:that.data.orderDetail._id,
            orderStatus:2,
            orderNumber:that.data.orderDetail.orderNumber,
            index
          }
        }).then(res=>{
          console.log(res)
        })

        var totalCredit  = that.data.totalCredit
        console.log(totalCredit)
        if(totalCredit > 0){
          wx.cloud.callFunction({
            name: "updateUserCredit",
            data:{
              _id: that.openid,
              totalCredit:totalCredit
            }
          }).then(res=>{
            console.log(res)
          })
        }

        let lackGoodsOrders = wx.getStorageSync("lackGoodsOrders") || [];

        if(!this.havedPush){
          lackGoodsOrders.push(that.data.orderDetail.orderNumber)
          this.havedPush = true;
          wx.setStorageSync("lackGoodsOrders",lackGoodsOrders);
        }

       }
     },
     fail: ()=>{},
     complete: ()=>{}
   });

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





  onTouchStart(event) {
   const currentIndex = event.currentTarget.dataset.index
   this.setData({
     currentIndex
   })

   this.data.orderDetail.theOrder.forEach((v,i)=>{
     if(i != currentIndex){
      var x = "orderDetail.theOrder[" + i + "].x";

       this.setData({
          [x]:0
       })
     }
   })
    if (event.touches[0]) {
      this.touchStartPosition = event.touches[0].clientX;
    }
  },

  onTouchMove(event) {

    if (event.touches[0]) {
      this.touchEndPosition = event.touches[0].clientX;
    }
  },

  onTouchEnd(event) {

    if (this.touchStartPosition && this.touchEndPosition) {
      // 滑动结束的时候增加x的距离值
      var index = event.currentTarget.dataset.index;
      var x = "orderDetail.theOrder[" + index + "].x";

      let delta = this.touchStartPosition - this.touchEndPosition;
      //left
      if (delta > 0) {
        if (delta > 40) {
          this.setData({
            [x]: -100
          })
        } else {
          this.setData({
            [x]: 0
          })
        }
      } else {
        //right
        if (Math.abs(delta) > 40) {
          this.setData({
            [x]: 0
          })
        } else {
          this.setData({
            [x]: -100
          })
        }
      }
      this.touchStartPosition = null;
      this.touchEndPosition = null;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */


  onShow: function (e) {
    
  },



})