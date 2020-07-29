import { async } from "../../utils/runtime";
const regeneratorRuntime = require('../../utils/runtime.js')
var formatDate = require('../../utils/formatDate.js')
const util = require('../../utils/util.js')

var getIdUtil = require('../../utils/getId.js')
var app =  getApp();
const DB = wx.cloud.database();
var formatDate = require('../../utils/formatDate.js')


// pages/manageAddress/index.js
Page({ 

  /**
   * 页面的初始数据
   */
  data: {


    tabs:[
      {
        id:0,
        value:"派送中",
        isActive:true
      },
      {
        id:1,
        value:"缺货中",
        isActive:false
      },
      {
        id:2,
        value:"已完成",
        isActive:false
      },
    
    ],
    miniTabs:[
      {
        id:0,
        value:"下单时间",
        isActive:true
      },
      {
        id:1,
        value:"送达时间",
        isActive:false
      },
      {
        id:2,
        value:"价格",
        isActive:false
      },
      {
        id:3,
        value:"距离",
        isActive:false
      }
    ],
    userOrder0:[],
    userOrder1:[],
    userOrder:[],
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false, //“没有数据”的变量，默认false，隐藏

    // 用户opneid数组
    userOpenId:[],

    //是否有缺货状态的订单
    haveLack:true,


     //选择送达时间
     multiArray: [],
     warning:'',
     startDate:'',
 
     defaultvalue:["尽快送达 | 半小时内"],

    //  统计
    totalOrder:0,
    totalSell:0,

    goodTotalShell:0,
    creditTotalShell:0,

    totalIncome:0,
    totalCredit:0,
    
    //是否都是普通商品
    isGeneration:true,
  },


    index:0,
    index2:0,
    currentPage : 0, // 当前第几页,0代表第一页 
    pageSize : 10, //每页显示多少数据 
  // 标题点击事件,从子组件传递过来
  handleTabsItemChange(e){

   
    // 获取被点击的标题索引
    const {index} = e.detail
    if(index === this.index){
      return
    } 
    this.index = index
    // 修改源数组,产生激活选中效果
    let {tabs} = this.data;

    tabs.forEach((v,i)=>i === index ? v.isActive = true : v.isActive = false);
    // 赋值到data中
    this.setData({
      tabs
    })
    //设置渲染页面的数据
    this.setTheOrder()

  },
  

  handleMiniTabsItemChange(e){
    
     // 获取被点击的标题索引
     const {index} = e.detail
    
     this.index2 = index

     // 修改源数组,产生激活选中效果
     let {miniTabs} = this.data;
 
     miniTabs.forEach((v,i)=>i === index ? v.isActive = true : v.isActive = false);
     // 赋值到data中
     this.setData({
      miniTabs
     })
      //设置渲染页面的数据
    this.setTheOrder()

  },



  year:0,
  month:0,
  onShow:async function () {

    let lackGoodsOrders = wx.getStorageSync("lackGoodsOrders") || [];
 
    // if(lackGoodsOrders!=undefined)
    let that = this
    this.openid = await app.getOpenid()
    //已完成选项的分时间查询
    var date = new Date();
    var currentYear = date.getFullYear()
    var currentMonth = date.getMonth()+1
    this.setData({
      startDate:currentYear+"年" +currentMonth +'月'
    })
    this.year = currentYear
    this.month = currentMonth
    var temp = [];
    temp[0] = []
    temp[1] = []

    var year = 2020
    var tempYear = currentYear
    while(tempYear !=year){
      temp[0].unshift(tempYear)
      tempYear--
    }
    temp[0].unshift(year)
    temp[0].unshift('全部')
    
    this.setData({
      multiArray:temp,
    })
   
    //设置渲染页面的数据
    this.setTheOrder();

   
   
  },
  pickerTap:function(){
    
  },
    
  

  bindStartMultiPickerChange:function(e){
    if(e != undefined){
      console.log(e)
      let temp = this.data.multiArray;
      var  startDate =''
      this.setData({
        userOrder:[]
      })
      if(temp[0][e.detail.value[0]] === '全部'){
        startDate = '全部'
      }else{
         startDate = temp[0][e.detail.value[0]]+' 年 '+temp[1][e.detail.value[1]]+' 月'
         this.year =  temp[0][e.detail.value[0]]
        this.month = temp[1][e.detail.value[1]]
      }
      this.setData({
        startDate
      })
      this.setTheOrder()
    }

    //选择好一个时间后就可以发送请求获取这个时间的数据了
    // wx.cloud.callFunction({
    //   name:'getOrderByTime'
    // })

  },
  bindMultiPickerColumnChange:function(e){
    // console.log("time",e)
    // console.log('第几列发生变化',e.detail.column)
    // console.log('选择第几个',e.detail.value)
    let c = e.detail.column;
    let v = e.detail.value;
    var time = [];
    var date = new Date();
    console.log(date)
    var date = new Date();
    var temp = this.data.multiArray;
    // currentHours = 12;
    if(c == 0){
      if(temp[c][v] === 2020){
        temp[1] = []
        var month = 5
        while(month <= 12){
          temp[1].push(month)
          month++
        }
      }else if(temp[c][v]==="全部"){
          temp[1] = []
      }else{
        temp[1] = []
        var month = 1
        while(month <= 12){
          temp[1].push(month)
          month++
        }
      }
      this.setData({
        multiArray:temp
      })
    }
  },
  onPullDownRefresh: function () {
  
    //设置渲染页面的数据
   this.setTheOrder().then(res=>{
     wx.showToast({
       title: '刷新成功',
       icon: 'success',
       duration: 1500,
       mask: false,
     });
   })
  },

  getTimeRange(){
    let minDate
    let maxDate
    let maxDate2
    if(this.data.startDate === '全部'){
      var date = new Date();
      this.year = date.getFullYear()
      this.month = date.getMonth()+1
      minDate = '2020' +"/" +'1' + "/" + "1" + " "+ "00:00:00"
      console.log("---",minDate)
    }else{
     minDate = this.year +"/" +(this.month) + "/" + "1" + " "+ "00:00:00"
     console.log("---",minDate)

    }
    
    maxDate = this.year+1 + "/" + '1' + "/" + "1" + " "+ "00:00:00"
    maxDate2 = this.year +"/" +(this.month + 1) + "/" + "1" + " "+ "00:00:00"  

    
    let minTime = new Date(minDate).getTime()
    console.log("*****",minTime)

    let maxTime 
    if(this.month===12){
      maxTime = new Date(maxDate).getTime()
    }else{

      maxTime = new Date(maxDate2).getTime()
      console.log("search",maxTime)

    }
    return {minTime:minTime,maxTime:maxTime}
  },

  //获得指定状态的用户订单
  getSomeOrder(status){

    return new Promise((resovle,reject)=>{
      wx.cloud.callFunction({
        name:'getSomeUserOrder',
        data:{
          status
        }
      }).then(res=>{
        console.log('someOrder',res)
        var usersOrder = res.result.list
        //下单成功的用户的订单数组
        // status=status===0 ? 1 : status

        let userOrder = [];

        usersOrder.forEach(element=>{
          // element.goods_order.forEach(element1=>{
          //   userOrder1.push(element1)
          // })
          if(element.goods_order!=null){
            userOrder =  userOrder.concat(element.goods_order)
          }
        })  
        resovle(userOrder)
      })
    })
 
    
  },

  theOrder:[],
  //获得已经完成的订单
  getOkOrder(){
    let that = this;
    let minTime = this.getTimeRange().minTime
    let maxTime = this.getTimeRange().maxTime
    //第一次加载数据
    if (this.currentPage == 1) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      })
    }
    return new Promise((resovle,reject)=>{
      wx.cloud.callFunction({
        name:'getOkOrder',
        data:{
          minTime:minTime,
          maxTime:maxTime,
          currentPage:that.currentPage , //从第几个数据开始
          pageSize:that.pageSize
        }
      }).then(res=>{
        console.log(res)
        var userOrder = res.result.data
        if (userOrder && userOrder.length > 0) {
          console.log("请求成功", userOrder)
          that.currentPage++
          // 将订单中的每个商品存好
          
          userOrder.forEach(e=>{
            that.theOrder = that.theOrder.concat(e.orderDetail)
            e.orderDetail.orderTime = formatDate.formatDate(e.orderDetail.orderTime)
            e.completeTime = formatDate.formatDate(e.completeTime)
          })

          console.log("theOrder",that.theOrder);
          wx.setStorageSync("theOrder",that.theOrder);

          //把新请求到的数据添加到dataList里  
          userOrder = that.data.userOrder.concat(userOrder)
          that.setData({
            userOrder, //获取数据数组    
            loadMore: false //把"上拉加载"的变量设为false，显示  
          });
          if (userOrder.length < that.pageSize) {
            that.setData({
              loadMore: false, //隐藏加载中。。
              loadAll: true //所有数据都加载完了
            });
          }
        } else {
          that.setData({
            loadAll: true, //把“没有数据”设为true，显示  
            loadMore: false //把"上拉加载"的变量设为false，隐藏  
          });
        }
        resovle(res.result.data)
      })
    })
  },
  setTheOrder(){
    return new Promise((resovle,reject)=>{

        if(this.index === 0){
        
        if(this.index2 === 0){
          this.getSomeOrder(1).then(res=>{
            this.getSomeOrder(0).then(res2=>{
              res2=res.concat(res2)
              console.log(res2)
             
              res2 =  res2.sort((a,b)=>{
                return Date.parse(b['orderTime']) - Date.parse(a['orderTime'])
              })
              // var i = 0
              // res2.forEach(e=>{
              //   e.diji = i
              //   i++
              // })
              //按下单时间降序排列
              this.setData({
                userOrder0:res2
              })
              this.setData({
                someOrder:this.data.userOrder0.length
              })
              wx.setStorageSync("theOrder",this.data.userOrder0);
              wx.stopPullDownRefresh();

            })
          })
        }else if(this.index2 === 1){
          let userOrder = this.data.userOrder0
          this.setData({
            userOrder0:userOrder.sort(this.timeCompare('startDate'))
          })        
          wx.setStorageSync("theOrder",this.data.userOrder0);
          
        }else if(this.index2 === 2){
          let userOrder = this.data.userOrder0
          this.setData({
            userOrder0: userOrder.sort(this.generalCompare('orderPrice'))
          })
          wx.setStorageSync("theOrder",this.data.userOrder0);

        }else{
          this.setData({
            userOrder0:  this.data.userOrder0.sort((a,b)=>{
              return a.consigneeAddr['distance'] - b.consigneeAddr['distance']
            })
          })
          wx.setStorageSync("theOrder",this.data.userOrder0);

        }
        

        }else if(this.index === 1){
          this.getSomeOrder(2).then(res=>{
            wx.setStorageSync("theOrder",res);
            // wx.setStorageSync("theOrderDetail"+status,userOrder);
      
            this.setData({
              userOrder1:res
            })
            wx.stopPullDownRefresh();

          })

        }else if(this.index === 2){
          this.setData({
            userOrder:[],
            loadMore: false, //"上拉加载"的变量，默认false，隐藏  
            loadAll: false, 
          })
          this.currentPage =  0; // 当前第几页,0代表第一页 
          this.pageSize = 10;

          this.getOkOrder().then(res=>{
            // wx.setStorageSync("theOrder",res);

            wx.stopPullDownRefresh();
          })
          let minTime = this.getTimeRange().minTime
          let maxTime = this.getTimeRange().maxTime
        
          wx.cloud.callFunction({
            name:'countOrder',
            data:{
              minTime:minTime,
              maxTime:maxTime,
            }
          }).then(res=>{
            console.log(res)
            this.setData({
              totalOrder:res.result.total
            })
          })

          wx.cloud.callFunction({
            name:'countOnefeild',
            data:{
              minTime:minTime,
              maxTime:maxTime,
            }
          }).then(res=>{
            console.log(res.result.list)
            this.setData({
              totalIncome:res.result.list[0].totalIncome,
              totalSell:res.result.list[0].totalSell,
              goodTotalShell:res.result.list[0].goodTotalShell,
              creditTotalShell:res.result.list[0].creditTotalShell,
              totalCredit:res.result.list[0].totalCredit
            })
          })
        }
        resovle(this.index)
    })
  },


  //拨打用户手机
  call: function (e) {
    const mobile = e.currentTarget.dataset.value
    wx.makePhoneCall({
      phoneNumber: mobile,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },

  handleLackGoods(e){
    wx.showModal({
      title: '提示',
      content: '确认将商品【】',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if(result.confirm){
          
        }
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },

  //完成订单

  //1、将订单和每个商品的status改为3
  //2、将订单存入商家数据库marketOrder中
  //3、增加用户总积分
  //4、增加订单中商品的销量
  completeOrder: util.throttle(function(e){
    let that = this

   
    wx.showModal({
      title: '提示',
      content: '确认完成订单吗？',
      cancelColor: '#000000',
      confirmText: '确定',
      // confirmColor: 'rgb(18,150,219)',
      success: (result) => {
        wx.showToast({
          title: '已完成',
          icon: 'success',
          mask:true,
        });
        if(result.confirm){

          const {index} = e.currentTarget.dataset
          var theOrder =that.data.userOrder0[index].theOrder
          //保存good_id的数组
          var goodsIdArr = []
          var goodsNumArr = []
          theOrder.forEach(element => {
            goodsIdArr.push(element.goods_id)
            goodsNumArr.push(element.num)
          });
          wx.cloud.callFunction({
            name:'updateUserOrder2',
            data:{
              // _id:that.data.orderDetail._id,
              orderStatus:3,
              orderNumber:that.data.userOrder0[index].orderNumber,
            }
          }).then(res=>{
            that.data.userOrder0.splice(index,1)
            that.setData({
              userOrder0:that.data.userOrder0
            })
            console.log(res)
          })

          var order = that.data.userOrder0[index]
          order.orderTime = new Date(order.orderTime).getTime()
          order.totalSell=0
          order.creditTotalShell = 0
          order.theOrder.forEach(e=>{
            if(e.status===0){//普通商品
              order.totalSell+=1
            }else{
              order.creditTotalShell+=1
            }
          })
          console.log(order)
          console.log(order.orderTime)
          wx.cloud.callFunction({
            name:'addCompleteOrder',
            data:{
              _id:getIdUtil.getId(),
              orderNumber:that.data.userOrder0[index].orderNumber,
              orderDetail:that.data.userOrder0[index],
              completeTime:new Date().getTime()
            }
          }).then(res=>{
            console.log(res)
          })

          wx.cloud.callFunction({
            name:'operateUserCredit',
            data:{
              orderNumber:that.data.userOrder0[index].orderNumber,
              totalCredit:that.data.userOrder0[index].orderPrice
            }
          }).then(res=>{
            console.log(res)
          })

          wx.cloud.callFunction({
            name:'updateSell',
            data:{
              goodsIdArr:goodsIdArr,
              goodsNumArr:goodsNumArr
            }
          }).then(res=>{
            console.log(res)
          })
        }
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },2000),
  /**
   *特殊写法:比较数组date日期
   */
  compare: function(property) {
    return function(a, b) {
      var value1 = Date.parse(a[property]);
      var value2 = Date.parse(b[property]);
      return value1 - value2 ;
    }
  },

  parseToDate(time){
    var day = time.slice(0,2)
    // 转为日
    var value1='1970-1-' ;
    if(day ==='尽快'|| day ==='今天'){
      value1+=1
    }else if(day ==='明天'){
      value1+=2
    }else if(day ==='后天'){
      value1+=3
    }
    // 转/追加时分秒
    var t = time.slice(time.lastIndexOf('|')+2)

    if(t === '半小时内'){
      value1+=' 00:00:00'
    }else{
      value1+=' '+t.slice(0,4)
    }
    return Date.parse(value1)
  },

  timeCompare: function(property) {
    var that = this
    return function(a, b) {
      var value1 =that.parseToDate(a[property])
      var value2 =that.parseToDate(b[property]);
      return value1 - value2 ;
    }
  },
  generalCompare: function(property) {
    return function(a, b) {
      var value1 =a[property];
      var value2 =b[property];
      return value1 - value2;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  // 暂时不用
CompareDate(d1,d2)
{
  return ((new Date(d1.replace(/-/g,"\/"))) < (new Date(d2.replace(/-/g,"\/"))));
},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
   if(this.index===2){
    console.log("上拉触底事件")
    let that = this
    if (!that.data.loadMore) {
      that.setData({
        loadMore: true, //加载中  
        loadAll: false //是否加载完所有数据
      });

      //加载更多，这里做下延时加载
      setTimeout(function() {
        that.getOkOrder()
      }, 1000)
    }
   }else{
     console.log("不请求")
   }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})