const regeneratorRuntime = require('../../utils/runtime.js')
var floatObj = require('../../utils/operateFloat.js')

//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsObj:{},
  
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
      showModalStatus: false,
      animationData: '',

      //购物车商品数据
      miniCart:[],

    },
     //自定义弹出提示框数据
     toastValue:{
      isShowToast:false,
      count:1000,
      toastText:'',
    },
    num:0,
  },

  //商品对象
  GoodsInfo:{},
  //用户总积分
  totalCredit:0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async  function (options) {
    const {goods_id} = options;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2].route;
    this.setData({
      prevPage
    })
    console.log(prevPage)
    this.totalCredit = wx.getStorageInfoSync('userinfo').totalCredit;
    var isGeneration = 'cart.isGeneration'
    if(this.data.cart.totalCredit === 0){
      this.setData({
        [isGeneration]:true
      })
    }
    this.openid = await app.getOpenid()

   　//获得弹出框组件
   this.myToast = this.selectComponent(".myToast")
    this.getCart()

    this.getGoodsDetail(goods_id);
    //可视窗口x,y坐标
    this.busPos = {};
    this.busPos['x'] = app.globalData.ww * .12;
    // this.busPos['x'] = app.globalData.ww /2;
    // this.busPos['y'] = app.globalData.hh - 10;
    this.busPos['y'] = app.globalData.hh * .95;

  },

  //从缓存中得到一些信息初始化购物车组件
  getCart(){
    
    // var cart = wx.getStorageSync("miniCart");
    // var miniCart = 'cart.miniCart'
    // var totalGood = wx.getStorageSync("totalGoods");
    // var totalPrice = wx.getStorageSync("totalPrice");
    // var totalCredit = wx.getStorageSync("totalCredit");

    // var totalPrices = 'cart.totalPrice'
    // var totalCredits = 'cart.totalCredit'
    // var isGeneration = 'cart.isGeneration'
    // var totalGoods = 'cart.totalGoods'
    // this.setData({
    //   [miniCart]:cart,
    //   [totalPrices]:totalPrice,
    //   [totalGoods]:totalGood,
    //   [totalCredits]:totalCredit
    // })
    // if(totalCredit===0){
    //   this.setData({
    //     [isGeneration]:true
    //   })
    // }else{
    //   this.setData({
    //     [isGeneration]:false
    //   })
    // }

    this.judgePrice() 
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

    
  },

  //判断是否可以起送
  
  
  judgePrice(){
    var color = 'cart.color'
    var priceMsg = 'cart.priceMsg'
    var disable = 'cart.disable'

    if(this.data.cart.totalPrice < this.data.cart.minPrice){
      this.setData({
        [color]:"#8a8a8a",
        [priceMsg]:"差"+floatObj.subtract(this.data.cart.minPrice ,this.data.cart.totalPrice,2)+"元起送",
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
    if(status === 1 &&  floatObj.add(this.data.cart.totalCredit,price,2) > this.totalCredit){
      this.setData({
        [count]: 2000,
        [toastText]: "您的总积分为"+ this.totalCredit +"~"
      });
      this.myToast.showToast();
      return false;
    }
    return true
  },


  handleSychronData(e){
    const { miniCart,
      index,
      status,
      num,
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
        [totalGoodss]:totalGoods,
        [totalPrices]:totalPrice,
        [totalCredits]:totalCredit,
        [colors]:color,
        [priceMsgs]:priceMsg,
        [disables]:disable,
        [isGenerations]:isGeneration,
      })

      if(status === 0){
        this.setData({
          num:0
        })
      }else{
        if(this.data.cart.miniCart[index].goods_id=== this.data.goodsObj.goods_id){
          this.setData({
            num
          })
        }
      }
      this.setData({
        [cart]:miniCart,
      })
  },

  //获取商品详情数据
  getGoodsDetail(id){
    let that = this;
    console.log(id)
    wx.cloud.callFunction({
      name :"getGoodsDetail",
      data:{
        goods_id:id
      },
      success(res){
        console.log(res)
        const goodsObj = res.result.data[0]
        goodsObj.goods_detail = goodsObj.goods_detail ||''
        //深拷贝
        that.GoodsInfo = JSON.parse(JSON.stringify(goodsObj)) ;
        that.GoodsInfo.goods_icon = that.GoodsInfo.goods_pics[0];

        that.setData({
          goodsObj
        })
        wx.setNavigationBarTitle({
          title: that.GoodsInfo.goods_name,
        });

        //查看购物车中是否有这个商品，存入索引
        let c = that.data.cart.miniCart|| []    
        let index = c.findIndex(v=>v.goods_id===goodsObj.goods_id);
        //初始化这个商品的数量
        if(index === -1){
          that.setData({
            num:0
          })
        }else{
          that.setData({
            num:c[index].num
          })
        }
        console.log("***yunGet成功", goodsObj)
      },
      fail(res){
        console.log("***yunGet失败",res)
      }
    })
  },

  //轮播图放大预览
  handlePreviewImage(e){ 
    const urls = this.GoodsInfo.goods_pics.map(v=>v)
    const current = e.currentTarget.dataset.url;
    //触发事件后要接受传来的图片url
    wx.previewImage({
      current,
      urls
    })
  },


   //点击商品触发的事件
   //1、
   addShopCart: async function(e) {
    let that = this

    if (!this.data.cart.hide_good_box) return;
    if(app.globalData.scopeUserInfo!=true && that.data.goodsObj.status === 1){
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
    if(!this.addToCart()) return

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

  async addToCart(){
    var that = this
    this.openid = await app.getOpenid()

    let cart = this.data.cart.miniCart|| []    

    console.log(cart)
    // var index = this.data.goods_index
    //查看购物车中是否有这个商品，存入索引
    let index = cart.findIndex(v=>v.goods_id===this.data.goodsObj.goods_id);
    var price = that.data.goodsObj.goods_price
    console.log(price)
    var status = that.data.goodsObj.status  
    console.log(this.data.cart.totalPrice)
    console.log(price)
    console.log(index)
    if(index === -1){
      // 不存在
      if(!this.judgeOver(cart,index,price,status))  return false

      that.GoodsInfo.num = 1;
      cart.unshift(that.GoodsInfo);
    }else{
      if(!this.judgeOver(cart,index,price,status)) return false

      cart[index].goods_price = floatObj.add(cart[index].goods_price,price)
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
        [totalCredit]:floatObj.add(this.data.cart.totalCredit,price,2),  
      })
    }else{
      that.setData({
        [totalPrice]:floatObj.add(this.data.cart.totalPrice,price,2),  
      })
    }
    this.setData({
      [miniCart]:cart,
      [totalGoods]:++that.data.cart.totalGoods,
      num:++that.data.num
    })
    that.judgePrice()

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

  async decreaseFromCart(){
    if(this.data.num === 0){
      return
     }

    
    var that = this
    this.openid = await app.getOpenid()

    let cart = this.data.cart.miniCart|| []    
    let index = cart.findIndex(v=>v.goods_id===this.GoodsInfo.goods_id);

    var price = that.data.goodsObj.goods_price  
    var isGeneration = 'cart.isGeneration'
    var status = that.data.goodsObj.status  

    console.log(cart)
    // 购物车中剩下最后一个商品
    if(this.data.num <= 1){
      cart.splice(index,1)
      this.setData({
        goods_index:-1
      })
      //没有积分商品了
      if(floatObj.subtract(this.data.cart.totalCredit ,price,2)<= 0){
        this.setData({
          [isGeneration]:true
        })
       }
    }else{
      cart[index].goods_price = floatObj.subtract(cart[index].goods_price, price, 2)
       cart[index].num--;
    }
   
      
    var miniCart = 'cart.miniCart'
    var totalGoods = 'cart.totalGoods'
    var totalPrice = 'cart.totalPrice'
    var totalCredit = 'cart.totalCredit'
    //积分商品
    if(status === 1){
      this.setData({
        [totalCredit]:floatObj.subtract(this.data.cart.totalCredit,price,2) 
      })
    }else{//普通商品
      this.setData({
        [totalPrice]:floatObj.subtract(this.data.cart.totalPrice,price,2) 
      })
    }
    this.setData({
      [miniCart]:cart,
      [totalGoods]:--that.data.cart.totalGoods,
      num:--that.data.num
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

          }
        
      }, 33);
     
  },
  

  
})