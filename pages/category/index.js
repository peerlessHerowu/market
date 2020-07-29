var getIdUtil = require('../../utils/getId.js')
const util = require('../../utils/util.js')
var floatObj = require('../../utils/operateFloat.js')

//引入发送请求的方法, 一定要把路径补全
import { request } from "../../request/index.js";
import { async } from "../../utils/runtime.js";
const regeneratorRuntime = require('../../utils/runtime.js')

//获取应用实例
var app = getApp()
//Page Object

Page({

  /**
   * 页面的初始数据
   */
  data: {

    //左侧菜单数据
    leftMenuList:[],
    //右侧菜单数据
    rightContent:[],
    //被点击的菜单
    currentIndex:0,
    //右侧商品的索引
    contentIndex:0,

  
    //购物车商品数组
    cart :[],


    //右侧滚动条距离顶部的距离
    scrollTop:0,

    heightArr:[],
    containerH:0,

    color:"#8a8a8a",

    //最低要多少才起送
    minPrice:app.globalData.minPrice,

    priceMsg:app.globalData.priceMsg,
    disable:true,
    hideCount: true, //角标初始是隐藏的
    // count: 0, //角标数
    //商品总量
    totalGoods:0,
    //商品总价
    totalPrice:0,
    totalCredit:0,
    //是否都是普通商品
    isGeneration:true,

    hide_good_box: true,
    feiBox: "",

    showModalStatus: false,
    animationData: '',

    //是否按销量排序：
    isSortBySell:false,
    isSortByPrice:false,
    sort:false,
    asc:true,
    desc:true,


    //自定义弹出提示框数据
    toastValue:{
      isShowToast:false,
      count:1000,
      toastText:'',
    }
  },

  //接口的返回数据
  Cates:[],
  // 购物车商品信息
  GoodsInfo:{},

  //用户总积分
  totalCredit:0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function () {

     // let index = cart.findIndex(v=>v.goods_id===this.data.GoodsInfo.goods_id);
   this.openid = await app.getOpenid()

   if(this.data.totalCredit === 0){
    this.setData({
      isGeneration:true
    })
  }
   　//获得弹出框组件
   this.myToast = this.selectComponent(".myToast")
     //如果是从确认订单页面回来的，
     var cartHint =  wx.getStorageSync("cartHint");
    if(cartHint != ''){  
      wx.showModal({
        title: '提示',
        content: cartHint,
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: (result) => {
          wx.removeStorageSync("cartHint");
        },
        fail: ()=>{},
        complete: ()=>{}
      });
    }
  
    //可视窗口x,y坐标
    this.busPos = {};
    this.busPos['x'] = app.globalData.ww * .12;
    // this.busPos['x'] = app.globalData.ww /2;
    // this.busPos['y'] = app.globalData.hh - 10;
    this.busPos['y'] = app.globalData.hh * .95;


    //小程序中存的时候没有做类型转换
    //获取本地存储中的数据
    const Cates = wx.getStorageSync("cates");
    if(!Cates){
      this.getClassifyData();
    }else{
      //数据没有过期就直接用
      if(Date.now() - Cates.time>1000*15){
        //数据过期就重新发送请求
        this.getClassifyData();
      }else{
        // console.log("old");
        this.Cates=Cates.data;

        //构造左侧的大菜单数据
        let leftMenuList = this.Cates.map(v=>v.cat_name);
        console.log(this.Cates)
        var fromOne = wx.getStorageSync("fromOne");

        if(fromOne){
          　var index = app.globalData.index
            console.log(index)
            //构造右侧的商品数据
            let rightContent = this.Cates[index].children;
                
            console.log("rightContent",rightContent)
            this.setData({
              currentIndex:index,
              rightContent,
            //重新设置右侧内容的scroll-view标签距离顶部的距离
              scrollTop:0
            })
            wx.removeStorageSync("fromOne");
        }else{
             //构造右侧的商品数据
          let rightContent = this.Cates[0].children;
          this.setData({
            leftMenuList,
            rightContent
          })
        }
      }
    }

    var orderHint =  wx.getStorageSync("orderHint");

    if(orderHint){
      wx.showModal({
        title: '提示',
        content: "已经帮您去除订单中缺货的商品~",
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success:(result)=>{
          wx.removeStorageSync("orderHint");
        }
      });
    }
    
    var that = this;
    //购物车的一些初始化工作
    //颜色，购物车商品数据、总量、总价格的渲染
    wx.cloud.callFunction({
      name:"getUserInfo",
  
      data:{
        _id: this.openid,
      }
    }).then(res=>{
      let cart = res.result.data[0].goods_cart || []    
      this.totalCredit = res.result.data[0].totalCredit 
      var totalGoods = 0
      var totalPrice = 0
      var totalCredit = 0

      var len = cart.length
      cart.forEach(element => {
        
        totalGoods+=element.num
        if(element.status === 0){
          totalPrice = floatObj.add(totalPrice,element.goods_price,2)
        }else{
          totalCredit = floatObj.add(totalCredit,element.goods_price,2)
          this.setData({
            isGeneration:false
          })
        }
      });

      
      
      this.setData({
        totalGoods,
        totalPrice,
        totalCredit,
        // currentIndex:0
      })
      this.judgePrice()
      this.setData({
        cart
      })
    })

  },
  // onPageScroll: util.throttle(function(e){
  //   console.log(e)
  //   const {scrollTop} =e.detail
  //   let s = scrollTop
  //   this.setData({
  //     scrollTop:s
  //   })
  //   console.log(this.data.scrollTop)
  // },300),
  //判断是否可以起送
  judgePrice(){
    if(this.data.totalPrice < this.data.minPrice){
      this.setData({
        color:"#8a8a8a",
        priceMsg:"差"+floatObj.subtract(this.data.minPrice , this.data.totalPrice,2)+"元起送",
        disable:true
      })
    }else{
      this.setData({
        color:"rgb(46, 40, 40)",
        priceMsg:"去结算",
        disable:false
      })
    }
  },

  //判断是否还可以加
  judgeOver(cart,index,price,status){
    //判断数量是否够并弹出提示框组件
    var count = 'toastValue.count'
    var toastText = 'toastValue.toastText'
    if(cart[index].num >= cart[index].goods_num){
      this.setData({
        [count]: 2000,
        [toastText]: "商品库存不够啦~"
      });
      this.myToast.showToast();
      return false;
    }
    
    console.log(this.totalCredit)
    //是积分商品并且积分不够了
    if(status === 1 && floatObj.add(this.data.totalCredit,price,2) > this.totalCredit){
      this.setData({
        [count]: 2000,
        [toastText]: "您的总积分为"+ this.totalCredit +"~"
      });
      this.myToast.showToast();
      return false;
    }
    return true
  },

  async onShow(){
   this.openid = await app.getOpenid()

    if(this.data.totalCredit === 0){
      this.setData({
        isGeneration:true
      })
    }
    var orderHint =  wx.getStorageSync("orderHint");

    if(orderHint){
      wx.showModal({
        title: '提示',
        content: "已经帮您去除订单中缺货的商品~",
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success:(result)=>{
          wx.removeStorageSync("orderHint");
        }
      });
    }
    
    var that = this;
    //购物车的一些初始化工作
    //颜色，购物车商品数据、总量、总价格的渲染
    wx.cloud.callFunction({
      name:"getUserInfo",
  
      data:{
        _id: this.openid,
      }
    }).then(res=>{
      let cart = res.result.data[0].goods_cart || []    
      this.totalCredit = res.result.data[0].totalCredit 
      var totalGoods = 0
      var totalPrice = 0
      var totalCredit = 0

      var len = cart.length
      cart.forEach(element => {
        
        totalGoods+=element.num
        if(element.status === 0){
          totalPrice = floatObj.add(totalPrice,element.goods_price,2)
        }else{
          totalCredit = floatObj.add(totalCredit,element.goods_price,2)
          this.setData({
            isGeneration:false
          })
        }
      });

      
      
      this.setData({
        totalGoods,
        totalPrice,
        totalCredit,
        // currentIndex:0
      })
      this.judgePrice()
      this.setData({
        cart
      })
    })
  },
  tempRight:[],
  sortBySalesVolume(){
    
    var isSortBySell = !this.data.isSortBySell

    var rightContent
    if(isSortBySell){
      rightContent = this.data.rightContent.sort((a,b)=>{
        return b['goods_sales_volumn'] - a['goods_sales_volumn']
      })
      this.setData({
        isSortBySell,
        rightContent,
        isSortByPrice:false,
        sort:false,
        asc:true,
        desc:true,
      })
    }else{
      var r = this.tempRight.concat()
      this.setData({
        isSortBySell,
        rightContent:r
      })
    }
  },

  sortByPrice(){

    var rightContent;
    if(!this.data.sort){
      rightContent = this.data.rightContent.sort((a,b)=>{
        return a['goods_price'] - b['goods_price']
      })
    
      this.setData({
        rightContent,
        sort:true,
        asc:false,
        isSortByPrice:true,
        isSortBySell:false,

      })
    }
    else if(!this.data.asc){
      rightContent = this.data.rightContent.sort((a,b)=>{
        return b['goods_price'] - a['goods_price']
      })
      this.setData({
        asc:true,
        desc:false,
        isSortByPrice:true,
        isSortBySell:false,
        rightContent
      })
    }
    else if(!this.data.desc){
      var r = this.tempRight.concat()
      this.setData({
        desc:true,
        sort:false,
        isSortByPrice:false,
        rightContent:r,
      })
    }
  },

  onPullDownRefresh: function () {
    this.setData({
      currentIndex:0
    })
    this.getClassifyData()
  },

  // upper(e) {
  //   let that = this
  //   const com = that.selectComponent('#tfresh')
  //   if (com.data.toprefresh) {
  //     return
  //   }
  //   console.log("scrollview top")
  //   com.refreshstart()

  //   this.getClassifyData()

  // },

  // scroll: function () {
  //   console.log("scroll...");
  //   this.data.scrolling = true;
  //   this.data.isLower = false;
  //   this.data.isUpper = false;
  // },
  // //下拉 滚动条 滚动顶底部时触发
  // upper: function () {
  //   console.log("upper....");
  //   this.data.isUpper = true;
  //   this.data.scrolling = false;
  // },
  // start: function (e) {
  //   console.log('start ');
  //   if (this.data.scrolling || this.data.loading) {
  //     return;
  //   }
  //   var startPoint = e.touches[0]
  //   var clientY = startPoint.clientY;
  //   this.setData({
  //     downY: clientY,
  //     refreshHeight: 0,
  //     loadMoreHeight: 0,
  //     pull: true,
  //     refreshing_text: '下拉刷新',
  //     loading_text: '上拉加载更多'
  //   });
  // },

  // end: function (e) {
  //   this.data.scrolling = false;
  //   if (this.data.refreshing) {
  //     return;
  //   }
  //   console.log('end');
  //   //释放开始刷新
  //   var height = this.data.loadingHeight;
  //   if (this.data.refreshHeight > this.data.loadingHeight) {
  //     this.setData({
  //       refreshHeight: height,
  //       loading: true,
  //       pull: false,
  //       refreshing_text: '正在刷新...'
  //     });
  //     this.refresh();
  //     this.loadFinish();
  //   } else if (this.data.loadMoreHeight > height) {
  //     this.setData({
  //       loadMoreHeight: height,
  //       loading: true,
  //       pull: false,
  //       loading_text: '正在加载更多...'
  //     });
  //     this.loadMore();
  //   } else {
  //     this.setData({
  //       refreshHeight: 0,
  //       loadMoreHeight: 0,
  //       loading: false,
  //       pull: true
  //     })
  //   }

  // },

  // //模拟刷新数据
  // refresh: function () {
  //   this.setData({
  //     currentIndex:0
  //   })
  //   this.getClassifyData()
  // },
  // move: function (e) {
  //   // console.log("move...:scrolling:" + this.data.scrolling, 'loading:' + this.data.loading
  //   // + 'isLower:' + this.data.isLower);
  //   if (this.data.scrolling || this.data.loading) {
  //     return;
  //   }
  //   var movePoint = e.changedTouches[0]
  //   var moveY = (movePoint.clientY - this.data.downY) * 0.6;
  //   //1.下拉刷新
  //   if (this.data.isUpper && moveY > 0) {
  //     console.log("下拉...dy:", moveY);
  //     this.setData({
  //       refreshHeight: moveY
  //     })
  //     if (this.data.refreshHeight > this.data.loadingHeight) {
  //       this.setData({
  //         pull: false,
  //         refreshing_text: '释放立即刷新'
  //       })
  //     } else {
  //       this.setData({
  //         pull: true,
  //         refreshing_text: '下拉刷新'
  //       })
  //     }
  //   } else if (this.data.isLower && moveY < 0) {//2上拉加载更多
  //     console.log("上拉...dy:", moveY);
  //     this.setData({
  //       loadMoreHeight: Math.abs(moveY)
  //     })
  //     if (this.data.loadMoreHeight > this.data.loadingHeight) {
  //       this.setData({
  //         pull: false,
  //         loading_text: '释放加载更多'
  //       })
  //     } else {
  //       this.setData({
  //         pull: true,
  //         refreshing_text: '上拉加载更多'
  //       })
  //     }
  //   }
  // },

  //获取分类数据
  getClassifyData(){
    let that = this;
    wx.cloud.callFunction({
      name :"giveCloudData",
      success(res){
        console.log("yunget成功", res.result.data)
        // console.log("yunAdd成功")
        that.Cates=res.result.data;

        //把接口数据存入本地存储中
        wx.setStorageSync("cates", {time:Date.now(),data:that.Cates});




        //构造左侧的大菜单数据
        let leftMenuList = that.Cates.map(v=>v.cat_name);
     
        //从首页来的
        var fromOne = wx.getStorageSync("fromOne");
        if(fromOne){
          　var index = app.globalData.index
            console.log(index)
            //构造右侧的商品数据
            let rightContent = that.Cates[index].children.concat();
            that.tempRight = rightContent.concat()

            console.log("rightContent",rightContent)
            that.setData({
              currentIndex:index,
              rightContent,
            //重新设置右侧内容的scroll-view标签距离顶部的距离
              scrollTop:0
            })
            wx.removeStorageSync("fromOne");
        }else{
             //构造右侧的商品数据
          let rightContent = that.Cates[0].children.concat();
          that.tempRight = rightContent.concat()


          that.setData({
            leftMenuList,
            rightContent
          })
        }
         //关闭下拉窗口
      wx.stopPullDownRefresh();
      },
      fail(res){
        console.log("yunAdd失败",res)
      }
    })
  },
  // 左侧菜单的点击事件
  handleItemTap(e){
    // console.log(e)
    const {index} = e.currentTarget.dataset;
    console.log(index)
    //构造右侧的商品数据
    let rightContent = this.Cates[index].children.concat();
    this.tempRight = rightContent.concat()

    //用户如果选了销量或价格排序就需要直接加载排序后的结果
    //1、如果点了按销量排序
    if(this.data.isSortBySell){
      rightContent = rightContent.sort((a,b)=>{
        return b['goods_sales_vlolum'] - a['goods_sales_vlolum']
      })
      console.log('rightContent1111',rightContent)
    }
    //1、如果点了按价格排序
    else if(!this.data.asc){
      rightContent = rightContent.sort((a,b)=>{
        return a['goods_price'] - b['goods_price']
      })
      console.log('rightConten222',rightContent)

    }
    else if(!this.data.desc){
      rightContent = rightContent.sort((a,b)=>{
        return b['goods_price'] - a['goods_price']
      })
      console.log('rightContent333',rightContent)

    }
    this.setData({
      rightContent,
      currentIndex:index,
      //重新设置右侧内容的scroll-view标签距离顶部的距离
        scrollTop:0
    })
    console.log(this.Cates[index].children)
    
   

  },

  
  // ready(){
   
  //   let query = wx.createSelectorQuery().in(this);
  //   let heightArr = [];
  //   let s = 0;
  //   query.selectAll('.goods_group').boundingClientRect((react) =>{
  //     console.log(react)
  //     react.forEach(res=>{
  //       s += res.height;
  //       heightArr.push(s)
  //     });
  //     console.log(heightArr)
  //     this.setData({
  //       heightArr : heightArr
  //     })
  //   });
  //   query.select('.right_content').boundingClientRect(res =>{
  //     console.log(res)
  //     this.setData({
  //       containerH: res.height
  //     })
  //   }).exec()
  // },

  // onScroll(e){
  //   let scrollTop = e.detail.scrollTop;
  //   let scrollArr = this.data.heightArr;
  //   if(scrollTop >= scrollArr[scrollArr.length - 1] - this.data.containerH){
  //     return
  //   }else{
  //     for(let i = 0; i < scrollArr.length; i++){
  //       if(scrollTop >= 0 && scrollTop < scrollArr[0]){
  //         this.setData({
  //           currentIndex : 0
  //         })
  //       }else if(scrollTop >= scrollArr[i - 1] && scrollTop < scrollArr[i]){
  //         this.setData({
  //           currentIndex:i
  //         })
  //       }
  //     }
  //   }
  // },


  getGoodsDetail(e){
    var index = e.currentTarget.dataset.index
    var goodId = this.data.rightContent[index].goods_id
    console.log(this.data.rightContent[index])
    let that = this;
    wx.cloud.callFunction({
      name :"getGoodsDetail",
      data:{
        goods_id:goodId
      },
      success(res){
       
        console.log("***yunGet成功", res)
      },
      fail(res){
        console.log("***yunGet失败",res)
      }
    })
  },

  //清空
  async clearAll(){

    let that = this
     wx.showModal({
      title: '提示',
      content: "确定要清空吗？",
      success: async function (sm) {
          

          if (sm.confirm) {
            wx.showToast({
              title: '正在删除',
              icon: 'loading',
              duration: 1000,
              mask: true
            })
            that.setData({
              totalGoods:0,
              cart:[],
              totalPrice:0,
              totalCredit:0,
              isGeneration:true,
              color:"#8a8a8a",
              priceMsg : app.globalData.priceMsg,
              disable:false,
              showModalStatus:false
            })
          that.openid = await app.getOpenid()

           console.log(that.openid)

            wx.cloud.callFunction({
              name: "updateUserCart",
              data:{
                _id: that.openid,
                cart:[]
              }
            }).then(res=>{
              wx.showToast({
                title: '已清空购物车',
                icon: 'success',
                duration: 1000,
                mask: true
              })
            })
          
          } else if (sm.cancel) {
            wx.showToast({
              title: '已取消清空',
              icon: 'success',
              duration: 1000,
              mask: true
            })
          }
        }
      })
    
  },

  //减少一个商品
  decreaseGood(e){
    var index = e.currentTarget.dataset.index
    console.log(index)

    var cart = this.data.cart
    var status = cart[index].status

    var price =floatObj.divide(cart[index].goods_price , cart[index].num,2)

    if( cart[index].num <= 1){
         cart.splice(index,1)
         //没有积分商品了
         if(floatObj.subtract(this.data.totalCredit,price,2) <= 0){
          this.setData({
            isGeneration:true
          })
         }
    }else{
        cart[index].goods_price=floatObj.subtract(cart[index].goods_price , price,2)
        cart[index].num--

    }
    //积分商品
    if(status === 1){
      this.setData({
        totalCredit:floatObj.subtract(this.data.totalCredit,price,2)
      })
    }else{//普通商品
      this.setData({
        totalPrice:floatObj.subtract(this.data.totalPrice,price,2)
      })
    }
    this.setData({
      cart,
      totalGoods:--this.data.totalGoods,
    })
   this.judgePrice()
    wx.cloud.callFunction({
      name:"updateUserCart",
  
      data:{
        _id: this.openid,
        cart:cart
      }
    }).then(res=>{
      console.log(res)
    })
  },

  //增加一件商品,可以用inc优化
  plusGood(e){ 
    var index = e.currentTarget.dataset.index
  
    var cart = this.data.cart
    // var price = (cart[index].goods_price*100) / (cart[index].num*100)
    var price =floatObj.divide(cart[index].goods_price , cart[index].num,2)

    console.log(price)
    var status = cart[index].status

    //判断数量是否够并弹出提示框组件
    if(!this.judgeOver(cart,index,price,status)) return

    console.log(price)
    // cart[index].goods_price=(cart[index].goods_price*100 + price*100)/100
    cart[index].goods_price=floatObj.add(cart[index].goods_price , price,2)

    cart[index].num++
    if(status === 1){
      this.setData({
        totalCredit:floatObj.add(this.data.totalCredit,price,2)
      })
    }else{
      this.setData({
        totalPrice:floatObj.add(this.data.totalPrice,price,2)

      })
    }
    // totalPrice += this.data.cart[index].goods_price

    this.setData({
      cart,
      totalGoods:++this.data.totalGoods,

    })
   
    this.judgePrice()

    wx.cloud.callFunction({
      name:"updateUserCart",
  
      data:{
        _id: this.openid,
        cart
      }
    }).then(res=>{
      console.log(res)
    })

   
    console.log(this.data.cart)
  },

  //跳转到确认订单页面
  toPay: util.throttle(function(){
    const DB = wx.cloud.database();

    DB.collection('manager').where({
        _id:'1'
      }).get().then(res=>{
        console.log(res)
        console.log(res.data[0].close)
        if(res.data[0].close===true){
          wx.showModal({
            title: '提示',
            content: '本店暂停营业,'+res.data[0].closeMsg +',先看看商品吧~',
            showCancel: false,
            cancelColor: '#000000',
            confirmText: '继续逛逛',
            confirmColor: '#3CC51F',
        
          });
          return
        }else{
          wx.setStorageSync("theOrder", this.data.cart);
          wx.setStorageSync("totalPrice", this.data.totalPrice);
          if(!app.globalData.scopeUserInfo){
            wx.navigateTo({
              url: '/pages/login/index',
              success: (result)=>{
                wx.redirectTo({
                  url: '/pages/pay/index',
                });
              },
              fail: ()=>{},
              complete: ()=>{}
            });  
          }else{
            console.log("on")
            wx.navigateTo({
              url: '/pages/pay/index',
              success: (result)=>{
                
              },
              fail: ()=>{},
              complete: ()=>{}
            });
          }
          
        }
      })
   

   
  },1000),

  //去凑单
  toScrabble:util.throttle(function(){
    var differ = floatObj.subtract(this.data.minPrice , this.data.totalPrice,2)
    wx.navigateTo({
      url: '/pages/scrabble/index?differ='+ differ,
    });
  },2000),

  // //跳转到详情页面
  // toDetail(){
  //   wx.setStorageSync("miniCart", this.data.cart);
  //   wx.setStorageSync("totalPrice", this.data.totalPrice);
  //   wx.setStorageSync("totalCredit", this.data.totalCredit);
  //   wx.setStorageSync("totalGoods", this.data.totalGoods);
  // },

   
  //点击商品触发的事件
  addShopCart: async function(e) {
     //把点击每一项的对应的商品图保存下来，就是飞向购物车的图片
    // this.setData({
    //     feiBox: this.data.imgUrls[e.currentTarget.dataset.idx]
    // })
    // 如果good_box正在运动
    if (!this.data.hide_good_box) return;
    var i = e.currentTarget.dataset.index

    if(app.globalData.scopeUserInfo!=true && this.data.rightContent[i].status === 1){
      //判断数量是否够并弹出提示框组件
     wx.showModal({
       title: '未登录',
       content: '登陆后才可以用积分兑换商品哦~',
       showCancel: true,
       cancelText: '取消',
       cancelColor: '#000000',
       confirmText: '去登录',
       confirmColor: '#3CC51F',
       success: (result) => {
         if(result.confirm){
            wx.navigateTo({
              url: 'pages/login/index',
            });  
         }
       },
     });
     return
    }

    let that = this
    // { ...this.GoodsInfo } = this.data.rightContent[i]
    // this.GoodsInfo  = this.data.rightContent[i]
    this.GoodsInfo  = JSON.parse(JSON.stringify(this.data.rightContent[i])) 

    let cart = this.data.cart || []   
    let index = cart.findIndex(v=>v.goods_id===that.GoodsInfo.goods_id);

    var  price = that.GoodsInfo.goods_price

    var status = this.GoodsInfo.status
    
    var count = 'toastValue.count'
    var toastText = 'toastValue.toastText'
    if(index === -1){
      // 不存在
      if(this.GoodsInfo.goods_num <=0 ){
        this.setData({
          [count]: 1000,
          [toastText]: "商品库存不够啦~"
        });
        this.myToast.showToast();
        return;
      }
      if(status === 1 && floatObj.add(this.data.totalCredit,price,2) > this.totalCredit){
        this.setData({
          [count]: 1000,
          [toastText]: "您的总积分为"+ this.totalCredit +"~"
        });
        this.myToast.showToast();
        return;
      }
      that.GoodsInfo.num = 1;
      cart.unshift(that.GoodsInfo);
    }else{
      if(!this.judgeOver(cart,index,price,status)) return

      cart[index].goods_price = floatObj.add(cart[index].goods_price,price,2)
      cart[index].num++;

    }
    
    if(status === 1){

      that.setData({
        isGeneration:false,
        totalCredit:floatObj.add(this.data.totalCredit,price,2)

      })
    }else{
      that.setData({
        totalPrice:floatObj.add(this.data.totalPrice,price,2)

      })
    }
  
    //当前点击位置的x，y坐标 
    this.finger = {};
    var topPoint = {};
    this.finger['x'] = e.touches["0"].clientX - 38;
    this.finger['y'] = e.touches["0"].clientY - 50;
    if (this.finger['y'] < this.busPos['y']) {
      topPoint['y'] = this.finger['y'] - 130; 
    } else {       
      topPoint['y'] = this.busPos['y'] - 130;     
    }

    topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;
    if (this.finger['x'] > this.busPos['x']) {
      topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
    } else {
      topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
    }
    this.linePos = app.bezier([this.finger, topPoint, this.busPos], 30);
    this.startAnimation();

    this.setData({
      cart,
      totalGoods: that.data.totalGoods += 1,
    })
    this.judgePrice()
    //将购物车加入到数据库中
    wx.cloud.callFunction({
      name:"updateUserCart",

      data:{
        _id: this.openid,
        cart:cart
      }
    }).then(res=>{
      console.log(res)
    })
  },
  //开始动画 
  startAnimation: function() {
      var index = 0,
          that = this,
          bezier_points = that.linePos['bezier_points'];
        // console.log(bezier_points)
        
      this.setData({
          hide_good_box: false,
          bus_x: that.finger['x'],
          bus_y: that.finger['y']
      })
      // var index = 28
      this.timer = setInterval(function() {
          index++;
          that.setData({
              bus_x: bezier_points[index]['x'],
              bus_y: bezier_points[index]['y'],
              
          })
        
          if (index >= 28) {
              clearInterval(that.timer);
              that.setData({
                  hide_good_box: true,
                  hideCount: false,
                  // color:"rgb(46, 40, 40)"
              })
          }
          // if(that.data.totalPrice >= that.data.minPrice){
          //   that.setData({
          //     color:"rgb(46, 40, 40)"
          //   })
          // }
      }, 33);
     
  },

  //点击底部弹出，显示购物详情
  showDetail(){
      if(this.data.totalGoods===0){
        return
      }
      // 显示遮罩层
      var showModalStatus =!this.data.showModalStatus
      if(showModalStatus){
         // 显示遮罩层
        var animation = wx.createAnimation({
          duration: 200,
          timingFunction: "linear",
          delay: 0
        })
        this.animation = animation
        animation.translateY(500).step()
        this.setData({
          animationData: animation.export(),
          showModalStatus: true
        })
        setTimeout(function () {
          animation.translateY(0).step()
          this.setData({
            animationData: animation.export()
          })
        }.bind(this), 200)
      }else{
        this.setData({
          showModalStatus: false,
        })
      }
    },
  hideModal: function () {
      this.setData({
        showModalStatus: false,
      })
  }
})