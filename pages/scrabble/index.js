import { values } from "../../utils/runtime"
var app =  getApp();
const regeneratorRuntime = require('../../utils/runtime.js')
const util = require('../../utils/util.js')
var floatObj = require('../../utils/operateFloat.js')
const DB = wx.cloud.database();
const _ = DB.command

var currentPage = 0; // 当前第几页,0代表第一页 
var pageSize = 10; //每页显示多少数据 
// pages/search/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchResult:[],
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false, //“没有数据”的变量，默认false，隐藏
    searchInput:'',
    

    scrollTop:0,
    //搜索历史
    searchHistory:[],

    //没有搜索
    noSearch:true,
    //显示搜索按钮
    isSearching:true,

    name_focus: true,
    disable:false,
    cart:{
      color:"#8a8a8a",

      //最低要多少才起送
     //最低要多少才起送
      minPrice:app.globalData.minPrice,

      priceMsg:app.globalData.priceMsg,
      disable:true,
      hideCount: true, //角标初始是隐藏的
      hide_good_box: true,
        //商品总量
      totalGoods:0,
      //商品总价
      totalPrice:0,
      totalCredit:0,

      showModalStatus: false,
      animationData: '',

      //是否都是普通商品
      isGeneration:true,

      //购物车商品数据
      miniCart:[],

    },
    //自定义弹出提示框数据
    toastValue:{
      isShowToast:false,
      count:1000,
      toastText:'',
    },
  
    isDefault:true,
    isSortBySell:false,
    isSortByPrice:false,
    sort:false,
    asc:true,
    desc:true,
  },
  
  searchInput:'',

  GoodsInfo:{},
  //用户总积分
  totalCredit:0,
  onLoad:async function (options) {
    this.openid = await app.getOpenid()
    this.myToast = this.selectComponent(".myToast")

    this.totalCredit = wx.getStorageInfoSync('userinfo').totalCredit;
      var isGeneration = 'cart.isGeneration'
      if(this.data.cart.totalCredit === 0){
        this.setData({
          [isGeneration]:true
        })
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
      var miniCart = 'cart.miniCart'
      var totalGoodss = 'cart.totalGoods'
      var totalPrices = 'cart.totalPrice'
      var totalCredits = 'cart.totalCredit'
      var isGeneration = 'cart.isGeneration'
      var totalGoods = 0
      var totalPrice = 0
      var totalCredit = 0
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
        [miniCart]:cart,
        [totalGoodss]:totalGoods,
        [totalPrices]:totalPrice,
        [totalCredits]:totalCredit
      })
      this.judgePrice()
    })

    //可视窗口x,y坐标
    this.busPos = {};
    this.busPos['x'] = app.globalData.ww * .12;
    // this.busPos['x'] = app.globalData.ww /2;
    // this.busPos['y'] = app.globalData.hh - 10;
    this.busPos['y'] = app.globalData.hh * .95;

   
   
    

  },

  onShow(){
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
   const {differ} = currentPage.options
    this.differ = differ
    this.searchForGoods()  
  },
  handleSychronData(e){
    const { miniCart,
      totalGoods,
      totalPrice,
      totalCredit,
      color,
      priceMsg,
      disable,
      isGeneration} = e.detail
    var cart  = 'cart.miniCart'
    var totalGoodss = 'cart.totalGoods'
    var totalPrices = 'cart.totalPrice'
    var totalCredits = 'cart.totalCredit'
    var colors = 'cart.color'
    var priceMsgs = 'cart.priceMsg'
    var disables = 'cart.disable'
    var isGenerations = 'cart.isGeneration'
      this.setData({
        [cart]:miniCart,
        [totalGoodss]:totalGoods,
        [totalPrices]:totalPrice,
        [totalCredits]:totalCredit,
        [colors]:color,
        [priceMsgs]:priceMsg,
        [disables]:disable,
        [isGenerations]:isGeneration,
      })

    
  },
   //判断是否可以起送
   judgePrice(){
    var color = 'cart.color'
    var priceMsg = 'cart.priceMsg'
    var disable = 'cart.disable'

    if(this.data.cart.totalPrice < this.data.cart.minPrice){
      this.setData({
        [color]:"#8a8a8a",
        [priceMsg]:"差"+floatObj.subtract(this.data.cart.minPrice , this.data.cart.totalPrice,2)+"元起送",
        [disable]:true
      })
    }else{
      this.setData({
        [color]:"rgb(46, 40, 40)",
        [priceMsg]:"去结算",
        [disable]:false
      })
    }
  },
  //判断是否还可以加
  judgeOver(cart,index,price,status){
    if(app.globalData.scopeUserInfo!=true && status === 1){
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
     return false
    }
    //判断数量是否够并弹出提示框组件
    var count = 'toastValue.count'
    var toastText = 'toastValue.toastText'
    console.log('idnex',index)
    if(this.GoodsInfo.goods_num <= 0 || (index!=-1 && cart[index].num >= cart[index].goods_num)){
      this.setData({
        [count]: 2000,
        [toastText]: "商品库存不够啦~"
      });
      this.myToast.showToast();
      return false;
    }
    //是积分商品并且积分不够了
    if(status === 1 && floatObj.add(this.data.cart.totalCredit,price,2) > this.totalCredit){
      this.setData({
        [count]: 2000,
        [toastText]: "您的总积分为"+ this.totalCredit +"~"
      });
      this.myToast.showToast();
      return false;
    }
    return true
  },

  //点击商品触发的事件
   //1、
   addShopCart: async function(e) {
    let that = this

    if (!this.data.cart.hide_good_box) return;

    if(!this.addToCart(e)) return
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

  },
  addToCart(e ){
    var i = e.currentTarget.dataset.index
    this.GoodsInfo  = JSON.parse(JSON.stringify(this.data.searchResult[i])) 
   
    console.log(this.GoodsInfo)
    var that = this

    let cart = this.data.cart.miniCart|| []    
    let index = cart.findIndex(v=>v.goods_id===that.GoodsInfo.goods_id);

    var price = this.GoodsInfo.goods_price  
    var status = this.GoodsInfo.status

    if(index === -1){
      if(!this.judgeOver(cart,index,price,status))  return false

      that.GoodsInfo.num = 1;
      cart.unshift(that.GoodsInfo);
    }else{
      if(!this.judgeOver(cart,index,price,status)) return false

      cart[index].goods_price = floatObj.add(cart[index].goods_price,price,2) 
      cart[index].num++;
      
    }
    var miniCart = 'cart.miniCart'
    var totalGoods = 'cart.totalGoods'
    var totalPrice = 'cart.totalPrice'
    var totalCredit = 'cart.totalCredit'
    var isGeneration = 'cart.isGeneration'
    if(status === 1){

      that.setData({
        [isGeneration]:false,
        [totalCredit]:floatObj.add(that.data.cart.totalCredit,price,2)
      })
    }else{
      that.setData({
        [totalPrice]:floatObj.add(that.data.cart.totalPrice,price,2)
      })
    }
    
    this.setData({
      [miniCart]:cart,
      [totalGoods]:++that.data.cart.totalGoods,
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
    return true
  },

   //开始动画 
   startAnimation: function() {
    var index = 0,
    that = this,
    bezier_points = that.linePos['bezier_points'];
      var hide_good_box  = 'cart.hide_good_box'
      var hideCount  = 'cart.hideCount'
      var bus_x = 'cart.bus_x' 
      var bus_y = 'cart.bus_y'
    this.setData({
      [hide_good_box]: false,
      [bus_x]: that.finger['x'],
      [bus_y]: that.finger['y']
    })
    // var index = 28
    this.timer = setInterval(function() {
        index++;
        that.setData({
            [bus_x]: bezier_points[index]['x'],
            [bus_y]: bezier_points[index]['y'],
            
        })
      
        if (index >= 28) {
            clearInterval(that.timer);
            that.setData({
                [hide_good_box]: true,
                [hideCount]: false,
            })
          that.judgePrice()

        }
      
    }, 33);
   
},

  dealResult(res){
    console.log(res)
    var that =  this
    this.setData({
      isSearching:false
    })
    if (res.data && res.data.length > 0) {
      console.log("请求成功", res.data)
      currentPage++
      var searchResult = res.data
      searchResult.forEach(e=>{
        e.goods_icon = e.goods_pics[0]
      })
      console.log(searchResult)
      //把新请求到的数据添加到dataList里  
      searchResult = that.data.searchResult.concat(searchResult)
      that.setData({
        searchResult,
        loadMore: false //把"上拉加载"的变量设为false，显示  
      });
      if (searchResult.length < pageSize) {
        that.setData({
          loadMore: false, //隐藏加载中。。
          loadAll: true //所有数据都加载完了
        });
      }
    } else{
      that.setData({
        loadAll: true, //把“没有数据”设为true，显示  
        loadMore: false //把"上拉加载"的变量设为false，隐藏  
      });
    }
    //关闭下拉窗口
    wx.stopPullDownRefresh(); 
    console.log('默认排序',this.data.searchResult)

  },

  searchForGoods: util.throttle(function(e){
   
    console.log("search")
    let that = this;
    currentPage = 0 // 当前第几页,0代表第一页 
    pageSize = 10 //每页显示多少数据 
    this.setData({
      noSearch:false,
      searchResult:[],
      loadMore: false, //"上拉加载"的变量，默认false，隐藏  
      loadAll: false, //“没有数据”的变量，默认false，隐藏
      isDefault:true,
      isSortBySell:false,
      isSortByPrice:false
    })
   this.pullSearchForGoods()
  },2000),

  pullSearchForGoods(){
    if (currentPage == 1) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      })
    }
      DB.collection('goods_detail').where( _.and([
        {
          goods_price:_.lte(parseInt(this.differ))

        },
        {
          status:_.eq(0)
        }
      ])).skip(parseInt(currentPage) * parseInt(pageSize)) //从第几个数据开始
     .limit(parseInt(pageSize))
     .get().then(res=>{
       console.log(res)
       this.dealResult(res)
     })
  },
  defaultSort: util.throttle(function(e){
    this.searchForGoods()
  },2000),

  sortBySalesVolume: util.throttle(function(e){
    
    currentPage = 0 // 当前第几页,0代表第一页 
    pageSize = 10
    this.setData({
      searchResult:[],
      loadMore: false, //"上拉加载"的变量，默认false，隐藏  
      loadAll: false, //“没有数据”的变量，默认false，隐藏
    })
    this.sortBySome('goods_sales_volumn','desc');
    this.setData({
      isSortBySell:true,
      isSortByPrice:false,
      sort:false,
      asc:true,
      desc:true,
      isDefault:false
    })
   
  },2000),

  sortByPrice: util.throttle(function(e){
    
    currentPage = 0 // 当前第几页,0代表第一页 
    pageSize = 10
    this.setData({
      searchResult:[],
      loadMore: false, //"上拉加载"的变量，默认false，隐藏  
      loadAll: false, //“没有数据”的变量，默认false，隐藏
    })
    if(!this.data.sort){
      this.sortBySome('goods_price','asc');

      this.setData({
        sort:true,
        asc:false,
        isSortByPrice:true,
        isSortBySell:false,
        isDefault:false

      })
    }
    else if(!this.data.asc){
      this.sortBySome('goods_price','desc');

      this.setData({
        asc:true,
        desc:false,
        isSortByPrice:true,
        isSortBySell:false,
        isDefault:false

      })
    }
    else if(!this.data.desc){
      this.pullSearchForGoods()
      this.setData({
        desc:true,
        sort:false,
        isSortByPrice:false,
        isDefault:false

      })
    }
  },2000),

  sortBySome(feild,orderRule){
    if (currentPage == 1) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      })
    }
      DB.collection('goods_detail').where(
      _.and([
        {
          goods_price:_.lte(parseInt(this.differ))

        },
        {
          status:_.eq(0)
        }
      ])
     ).orderBy(feild, orderRule)
     .skip(parseInt(currentPage) * parseInt(pageSize)) //从第几个数据开始
     .limit(parseInt(pageSize))
     .get().then(res=>{
       console.log(res)
       this.dealResult(res)
     })
  },

  onPullDownRefresh: function () {
    this.differ = floatObj.subtract(this.data.cart.minPrice , this.data.cart.totalPrice,2)
    if(this.data.isDefault || !this.data.isSortByPrice){
      this.searchForGoods()
    }else if(this.data.isSortBySell){
      this.sortBySalesVolume();
    }else if(this.data.isSortByPrice){
      this.sortByPrice()
    }
  },

  onPageScroll: function (e) {
    this.setData({
      scrollTop:e.scrollTop
    })
  },
  onReachBottom: function() {
    console.log("上拉触底事件")
    let that = this
    if (!that.data.loadMore) {
      that.setData({
        loadMore: true, //加载中  
        loadAll: false //是否加载完所有数据
      });

      //加载更多，这里做下延时加载
      setTimeout(function() {
        if(that.data.isDefault || !that.data.sort){
          that.pullSearchForGoods()
        }else if(that.data.isSortBySell){
          that.sortBySome('goods_sales_volumn','desc');
        }else if(!that.data.asc){
          that.sortBySome('goods_price','asc');
        }else if(!that.data.desc){
          that.sortBySome('goods_price','desc');
        }
      }, 1000)
    }
  },
  
})