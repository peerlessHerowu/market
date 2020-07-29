// pages/pay/index.js
const regeneratorRuntime = require('../../utils/runtime.js')
var formatDate = require('../../utils/formatDate.js')
var getIdUtil = require('../../utils/getId.js')
var orderNumberUtil = require('../../utils/randomOrderNumber.js')
const util = require('../../utils/util.js')
var floatObj = require('../../utils/operateFloat.js')

const DB = wx.cloud.database();

//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //自定义toast
    isShowToast:false,
    count:1000,
    toastText:'',

    chooseAddress:"请选择收获地址",

    //选择送达时间
    multiArray: [],
    warning:'',
    startDate:'',

    defaultvalue:["尽快送达 | 半小时内"],

    //这次订单数据
    theOrder:[],
    //商品总价
    totalPrice:0,
    totalCredit:0,
    //商品总量
    totalNum:0,

    //运费
    choosed:false,
    freight:0,
    freightMsg:"请选择收获地址",

    //订单备注
    orderRemark:'',

    //是否都是普通商品
    isGeneration:true,
  },
getFormid(e){
  console.log("获取到的formid",e.detail.formid)
  this.setData({
    formid:e.detail.formid
  })
},

sendMsg(){
  let formid =  this.data.formid

  wx.cloud.callFunction({
    name:'orderRemind',
    data:{
      formid:formid
    }.then(res=>{
      console.log(res)
    })
  })
},


  async onLoad(){
   this.openid = await app.getOpenid()
    // this.onShow()

    var date = new Date();
    var currentHours = date.getHours();
    var currentMinute = date.getMinutes();
    var temp = [];
    console.log(currentHours)
    console.log(currentMinute)
    // currentHours = 12;
    var temp_time = [];
    //如果当前时间大于20点
    if(currentHours>1 && currentHours < 9){
      this.setData({
        warning:'当前时间段不在服务范围,现在下单,最早将于早上9点起送',
        startDate:'今日 | 9:00-24:00、00:00-01:00'
      })
      // temp[0] = ["明天","后天","大后天"];
      temp[0] = ["今天","明天","后天"];
      temp[1] = []; 
      // for(let i=0;i<1;){
      //   var i1 = i+1;
      //   temp[1].push(i+':00'+'-'+i+':30')
      //   temp[1].push(i+':30'+'-'+i1+':00')
      //   i++;
      // }
      for(let i=9;i<24;){
        var i1 = i+1;
        temp[1].push(i+':00'+'-'+i+':30')
        temp[1].push(i+':30'+'-'+i1+':00')
        i++;
      }
    }else{
      this.setData({
        startDate:'尽快送达 | 半小时内'
      })
      temp[0] = ["今天","明天","后天"];
      temp[1] = ["尽快送达|半小时内"];
      if(currentMinute < 45 && currentMinute > 15){
        for(let i=currentHours+1;i<24;){
          var i1 = i+1;
          temp[1].push(i+':00'+'-'+i+':30')
          temp[1].push(i+':30'+'-'+i1+':00')
          i++;
        }
        
      }else if(currentMinute < 15){
        for(let i=currentHours;i<24;){
          var i1 = i+1;
          temp[1].push(i+':30'+'-'+i1+':00')
          if(i1<24){
            temp[1].push(i1+':00'+'-'+(i1+1)+':30')
          }
          i++;
        }
      }else{
        for(let i=currentHours+1;i<24;){
          var i1 = i+1;
          temp[1].push(i+':30'+'-'+i1+':00')
          if(i1<24){
            temp[1].push(i1+':00'+'-'+(i1+1)+':30')
          }
          i++;
        }
      }
      
    }
    this.setData({
      multiArray:temp,
    })
    if(this.data.warning!=''){
      wx.showToast({
        title: this.data.warning,
        icon: 'none',
        duration: 3000
      })
    }
    console.log(temp)
    console.log(temp_time)
  },
  /**
   * 生命周期函数--监听页面加载
   */

  //  获得收获地址
  onShow: function (options) {
    var addr = wx.getStorageSync("choosedAddress")
    var theOrder = wx.getStorageSync("theOrder")
    var orderRemark = wx.getStorageSync("orderRemark")
    // var totalPrice = wx.getStorageSync("totalPrice")

   var freight = 0;
   if(addr !=''){
     if(addr.distance < 1){
       freight = 0;
     }else{
       freight = 2
     }
     this.setData({
       choosed:true,
       freight,
       chooseAddress:addr
     })
   }

   var totalPrice = freight
   var totalCredit = 0
   theOrder.forEach(e=>{
    if(e.status === 0){
     totalPrice = floatObj.add(totalPrice,e.goods_price,2)
    }else{
      totalCredit = floatObj.add(totalCredit,e.goods_price,2)
      this.setData({
        isGeneration:false
      })
    }
  })

  if(orderRemark === ''){
    this.setData({
      orderRemark:'点击输入您的备注'
    })
  }else{
    this.setData({
       orderRemark
    })
  }
   var totalNum = 0
   theOrder.forEach(element => {
    totalNum+=element.num
  });
  this.setData({
    theOrder,
    totalPrice,
    totalCredit,
    totalNum
  })
    
     
  },

  // onUnload(){
  //   wx.removeStorageSync("orderRemark");
  // },

  //跳转到运费说明页面
  handleQuestion(){
   wx.setStorageSync("freight", freight);
    wx.navigateTo({
      url: '/pages/freightExplain/index',
    })
  },

  //跳转到输入订单备注页面
  toInputRemark(){
    wx.navigateTo({
      url: '/pages/orderRemark/index',
    });
  },

//自定义信息提示弹出框
showToast: function () {
  var that = this;
  // toast时间  
  that.data.count = parseInt(that.data.count) ? parseInt(that.data.count) : 3000;
  // 显示toast  
  that.setData({
    isShowToast: true,
  });
  // 定时器关闭  
  setTimeout(function () {
    that.setData({
     isShowToast: false
   });
  }, that.data.count);
  
},

  chooseAddress:util.throttle(function(){
    // console.log("llfd")
    var arr = wx.getStorageSync('addressList') || [];
    console.log(arr)


    //缓存没有，
    if(arr.length == 0){
      console.log("空")
      wx.cloud.callFunction({
        name:'getUserInfo',
        data:{
          _id:this.openid
        }
       }).then(res=>{
         console.log(res)
         if( res.result.data[0].deliverAddress == undefined || res.result.data[0].deliverAddress.length ===0){
          console.log("空2")
          wx.navigateTo({
            url : "/pages/addAddress/index",
            success: (result)=>{
              
            },
            fail: ()=>{},
            complete: ()=>{}
          });
          return
        }else{
          
          wx.navigateTo({
            url : "/pages/addressList/index",
            success: (result)=>{
              
            },
            fail: ()=>{},
            complete: ()=>{}
          });
          return
        }
       })
    }else{
      //缓存有，直接去地址列表页面拿缓存的
      wx.navigateTo({
        url : "/pages/addressList/index",
        success: (result)=>{
          
        },
        fail: ()=>{},
        complete: ()=>{}
      });
    }

   
  },2000),

  bindTransportDayChange: function(e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);
    this.setData({
      transportIndex: e.detail.value
    })

    var transportDay = e.detail.value.transportDay;
    
  },

   
  bindStartMultiPickerChange:function(e){
    
    if(e != undefined){
      if(temp[1][e.detail.value[1]] === undefined){
        this.setData({
          startDate:temp[0][e.detail.value[0]]+' | ' + "未选择时间"
        })
      }
      console.log(e)
      let temp = this.data.multiArray;
      this.setData({
        startDate:temp[0][e.detail.value[0]]+' | '+temp[1][e.detail.value[1]]
      })
    }
  },

  pickerTap:function(){
    
  },
  bindMultiPickerColumnChange:function(e){
    console.log("time",e)
    console.log('第几列发生变化',e.detail.column)
    console.log('选择第几个',e.detail.value)
    let c = e.detail.column;
    let v = e.detail.value;
    var time = [];
    var date = new Date();
    console.log(date)
    var date = new Date();
    var currentHours = date.getHours();
    var currentMinute = date.getMinutes();
    var temp = this.data.multiArray;
    // currentHours = 12;
    if(c == 0){
      if(temp[c][v] == '今天'){
        temp[1] = ["尽快送达|半小时内"];
        if(currentHours >= 0 && currentHours <= 1){
          if(currentMinute < 45 && currentMinute > 15){
            for(let i=currentHours+1;i<1;){
              var i1 = i+1;
              temp[1].push(i+':00'+'-'+i+':30')
              temp[1].push(i+':30'+'-'+i1+':00')
              i++;
            }
            
          }else if(currentMinute < 15){
            for(let i=currentHours;i<1;){
              var i1 = i+1;
              temp[1].push(i+':30'+'-'+i1+':00')
              if(i1<1){
                temp[1].push(i1+':00'+'-'+(i1+1)+':30')
              }
              i++;
            }
          }else{
            for(let i=currentHours+1;i<1;){
              var i1 = i+1;
              temp[1].push(i+':30'+'-'+i1+':00')
              if(i1<1){
                temp[1].push(i1+':00'+'-'+(i1+1)+':30')
              }
              i++;
            }
          }
        }else{
          if(currentMinute < 45 && currentMinute > 15){
            for(let i=currentHours+1;i<24;){
              var i1 = i+1;
              temp[1].push(i+':00'+'-'+i+':30')
              temp[1].push(i+':30'+'-'+i1+':00')
              i++;
            }
            
          }else if(currentMinute < 15){
            for(let i=currentHours;i<24;){
              var i1 = i+1;
              temp[1].push(i+':30'+'-'+i1+':00')
              if(i1<24){
                temp[1].push(i1+':00'+'-'+(i1+1)+':30')
              }
              i++;
            }
          }else{
            for(let i=currentHours+1;i<24;){
              var i1 = i+1;
              temp[1].push(i+':30'+'-'+i1+':00')
              if(i1<24){
                temp[1].push(i1+':00'+'-'+(i1+1)+':30')
              }
              i++;
            }
          }
        }
      }else if(temp[c][v] == '明天'){
        temp[1] = [];
        for(let i=0;i<1;){
        var i1 = i+1;
        temp[1].push(i+':00'+'-'+i+':30')
        temp[1].push(i+':30'+'-'+i1+':00')
        i++;
        }
        for(let i=9;i<24;){
          var i1 = i+1;
          temp[1].push(i+':00'+'-'+i+':30')
          temp[1].push(i+':30'+'-'+i1+':00')
          i++;
        }
      }else if(temp[c][v] == '后天'){
        temp[1] = [];
        for(let i=0;i<1;){
          var i1 = i+1;
          temp[1].push(i+':00'+'-'+i+':30')
          temp[1].push(i+':30'+'-'+i1+':00')
          i++;
        }
     
      }
      this.setData({
        multiArray:temp
      })
    }
  },


  // sortById(a,b){
  //   arr.locateCompare()

  // },

  goods_order : {},
  //确认订单
  confirmOrder:util.throttle(function(e){

    var that = this
    if(this.data.chooseAddress === "请选择收获地址"){
      this.setData({
      count: 1500,
      toastText: "请选择收货地址"
    });
    this.showToast();
    return
    } 
    var hint1 = "非常抱歉,"
    var hint2 = "请您重新选择"
    var cartHint = ''
    var carthint1 = "您好，您选择的"
    var carthint2 = "数量已经自动减少到库存量啦~"
    var isLack = false
  
    var that = this
    //保存good_id的数组
    var goodsIdArr = []
    var goodsNumArr = []
    //订单数组
    var theOrder = this.data.theOrder.concat()
    var [ ...temp ] = theOrder
    theOrder.forEach(element => {
      goodsIdArr.push(element.goods_id)
      goodsNumArr.push(element.num)
    });
 
    console.log(goodsIdArr)

    wx.showModal({
      title: '下单确认',
      content:'确认要下单吗？您选择的送达时间是【'+this.data.startDate+'】,如需修改请点击取消',
      confirmText:"确认下单",
      success: function (sm) {
        
        if (sm.confirm) {
          wx.cloud.callFunction({
            name:"getSomeGoods",
            data:{
              goodsIdArr:goodsIdArr
            }
          }).then(res=>{
             console.log(res)
             var arr = res.result.data
            //  let new_arr = arr.map(obj => {return obj.goods_num})
            var len = arr.length
            var lackGoodId=[]
            wx.showToast({
              title: '下单中……',
              icon: 'loading',
              duration: 1000,
              mask: true
            })
            //获得缺货商品id并组成提示信息，用来将来展示给用户
            arr.forEach(element=>{
              for (let i = 0; i < len; i++) {
                if(element.goods_id === theOrder[i].goods_id){
                  console.log(element.goods_id ,"----", theOrder[i].goods_id)
                  var goods_num = element.goods_num
                  var theOrderNum =  theOrder[i].num
                  if(goods_num < theOrderNum){
                      isLack = true
                      carthint1+="【"+theOrder[i].goods_name+"】"
                      hint1 +="【"+theOrder[i].goods_name+"】"+"库存仅剩"+goods_num+","
                      if(goods_num === 0){
                          lackGoodId.push(theOrder[i].goods_id)
                          break;
                      }
                    //  计算该商品单价
                      var price = theOrder[i].goods_price / theOrderNum 
                    //  更新商品数量为库存量
                      theOrder[i].num = goods_num
                      //更新该商品总价格
                      theOrder[i].goods_price = goods_num * price  
                     
                  }
                }
              }
            })
            //过滤出未缺货商品得到新的的订单数组
            theOrder = theOrder.filter(function(x, index) {
                return lackGoodId.findIndex(v=>v === x.goods_id) === -1
                
              }); 
             
             //判断库存是否够
             if(isLack){
              hint1+=hint2
              cartHint =  carthint1+=carthint2
               wx.showModal({
                 title: '库存不足',
                 content:hint1,
                 showCancel:false,
                 confirmText:"重新选择",
                 success: function (sm) {
                   
                   if (sm.confirm) {
                     //点击确定后回到商品列表页面，购物车的数据置为库存量
                     wx.cloud.callFunction({
                       name:'updateUserCart',
                       data:{
                        _id: that.openid,
                        cart:theOrder
                       }
                     }).then(res=>{
                       wx.setStorageSync("cartHint", cartHint);
                       wx.navigateBack({
                         delta: 1
                       });
                     })
      
                   }
                 }
               });
             }else{
              that.goods_order.orderPrice = that.data.totalPrice
              that.goods_order.orderCredit = that.data.totalCredit
              that.goods_order.totalNum = that.data.totalNum
              that.goods_order.consigneeAddr = that.data.chooseAddress
              that.goods_order.startDate = that.data.startDate
              that.goods_order.orderPayModel = 1
              that.goods_order.orderTime = formatDate.formatDate(new Date().getTime())
              // that.goods_order.orderTimeTemp = new Date().getTime()
              that.goods_order.theOrder = that.data.theOrder
              that.goods_order.orderRemark = that.data.orderRemark
              that.goods_order.freight = that.data.freight
              let fromLackGoods = wx.getStorageSync("fromLackGoods");
              console.log(fromLackGoods==='')
              if(fromLackGoods!=''){
                that.goods_order.orderStatus  = 0
    
                that.goods_order.orderNumber = fromLackGoods.orderNumber
                that.updateUserOrder(fromLackGoods.index)
    
                //更新库存量
                
                wx.cloud.callFunction({
                  name:'updateNum',
                  data:{
                    goodsIdArr:goodsIdArr,
                    goodsNumArr:goodsNumArr
                  }
                })

                  //清空购物车
                  wx.cloud.callFunction({
                    name: "updateUserCart",
                    data:{
                      _id: that.openid,
                      cart:[]
                    }
                  }).then(res=>{
                    console.log(res)
                  })
  
                  //用户如果买了积分商品，则减少用户积分
  
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
              }
              //0：修改订单成功
              // 1:下单成功
              // 2、已送达
              // 3、缺货中
              // 订单存入数据库
             
              else{
                that.goods_order.orderStatus  = 1
    
                that.goods_order.orderNumber = 'MSMK'+ orderNumberUtil.randomNumber()
                that.addUserOrder()
                 //更新库存量
                
                 console.log(goodsIdArr)
                 console.log(goodsNumArr)
                 wx.cloud.callFunction({
                  name:'updateNum',
                  data:{
                    goodsIdArr:goodsIdArr,
                    goodsNumArr:goodsNumArr
                  }
                })

                //清空购物车
                wx.cloud.callFunction({
                  name: "updateUserCart",
                  data:{
                    _id: that.openid,
                    cart:[]
                  }
                }).then(res=>{
                  console.log(res)
                })

                //用户如果买了积分商品，则减少用户积分

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
              
              }
             }
          })
         
        }
      }
    });
 
   
  },2000),

  addUserOrder(){
    let that = this
    let theOrder = that.data.theOrder
    theOrder.forEach(element=>{
      element.orderStatus = 1
    })
    console.log(that.goods_order)

    
    // 缓存中存入成功标志
    wx.setStorageSync("success", true);
    //存入缓存
    let goods_orders = wx.getStorageSync("goods_orders").data || [];
    goods_orders.unshift(that.goods_order)
    wx.setStorageSync("goods_orders",{time:Date.now(),data:goods_orders});

    //存入数据库
    wx.cloud.callFunction({
      name:"addUserOrder",
      data:{
         _id: that.openid,
        goods_order:that.goods_order
      }
    }).then(res=>{

      console.log(res)
        //跳转至订单页面
      wx.switchTab({
        url: '/pages/order/index',
      })
    })
  },

  updateUserOrder(index){
    let that = this
    let theOrder = that.data.theOrder

    theOrder.forEach(element=>{
      element.orderStatus = 0
    })
    console.log(that.goods_order)
    wx.showToast({
      title: '下单中……',
      icon: 'loading',
      duration: 1000,
      mask: true
    })
    // 缓存中存入成功标志
    wx.setStorageSync("success", true);
    //更新缓存
    let goods_orders = wx.getStorageSync("goods_orders").data || [];
    goods_orders.splice(index,1)
    goods_orders.unshift(that.goods_order)
    wx.setStorageSync("goods_orders",{time:Date.now(),data:goods_orders});

    //存入数据库
    wx.cloud.callFunction({
      name:"updateTheOrder",
      data:{
        orderNumber: that.goods_order.orderNumber,
        goods_order:that.goods_order
      }
    }).then(res=>{

      console.log(res)

      //修改完后清掉

      wx.removeStorageSync("fromLackGoods");
        //跳转至订单页面
      wx.switchTab({
        url: '/pages/order/index',
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})