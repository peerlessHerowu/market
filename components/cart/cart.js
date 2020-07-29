// components/cart/cart.js
const regeneratorRuntime = require('../../utils/runtime.js')
const util = require('../../utils/util.js')
var floatObj = require('../../utils/operateFloat.js')
var app =  getApp();


Component({
  /**
   * 组件的属性列表
   */
  properties: {

   cart:{
     type:Object,
     value:{}
   }
  },

  lifetimes:{
    attached:async function(){
      this.openid = await app.getOpenid()
      this.myToast = this.selectComponent(".myToast")

      this.totalCredit = wx.getStorageInfoSync('userinfo').totalCredit;
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1].route;
      let prevPage = pages[pages.length - 2].route;
      this.setData({
        currentPage,
        prevPage
      })
    console.log(currentPage)
    console.log(prevPage)
    }
  },

  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的初始数据
   */
  data: {
    showModalStatus: false,
    animationData: '',
    //自定义弹出提示框数据
    toastValue:{
      isShowToast:false,
      count:1000,
      toastText:'',
    },
    num:0,
    index:0,
    // 1、减
    // 2、加
    status:0
  },

  /**
   * 组件的方法列表
   */
  methods: {

    sychronData(){
      var cart = this.data.cart
      this.triggerEvent('sychronData',{
        miniCart:cart.miniCart,
        totalGoods:cart.totalGoods,
        totalPrice:cart.totalPrice,
        totalCredit:cart.totalCredit,
        color:cart.color,
        priceMsg:cart.priceMsg,
        disable:cart.disable,
        isGeneration:cart.isGeneration,
        status:this.data.status,
        index:this.data.index,
        num:this.data.num
      })
    },

    
  //跳转到确认订单页面
  toPay:util.throttle(function(){
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
         
          wx.setStorageSync("theOrder", this.data.cart.miniCart);
          wx.setStorageSync("totalPrice", this.data.cart.totalPrice);
          if(!app.globalData.scopeUserInfo){
            wx.navigateTo({
              url: '/pages/login/index',
              success: (result)=>{
                wx.redirectTo({
                  url: '/pages/pay/index',
                });
              },
            });  
          }else{
            console.log("on")
            wx.navigateTo({
              url: '/pages/pay/index',
            });
          }
        }
      })
   
    
  },2000),

    //去凑单
    toScrabble:util.throttle(function(){
      var differ = floatObj.subtract(this.data.cart.minPrice , this.data.cart.totalPrice,2)
      wx.navigateTo({
        url: '/pages/scrabble/index?differ='+ differ,
      });
    },2000),
    //清空
    clearAll(){

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

            

              var cart = 'cart.miniCart'
              var totalGoods = 'cart.totalGoods'
              var totalPrice = 'cart.totalPrice'
              var totalCredit = 'cart.totalCredit'
              var color = 'cart.color'
              var priceMsg = 'cart.priceMsg'
              var disable = 'cart.disable'
              var isGeneration = 'cart.isGeneration'
              that.setData({
                [cart]:[],
                [totalGoods]:0,
                [totalPrice]:0,
                [totalCredit]:0,
                [color]:"#8a8a8a",
                [priceMsg] : app.globalData.priceMsg,
                [disable]:false,
                [isGeneration]:true,
                showModalStatus:false,
                status:0,
                num:0,
              })
              that.sychronData();

            //调用这个函数，触发父组件事件handleSychronData，改变数据
            console.log(that.openid)

              wx.cloud.callFunction({
                name: "updateUserCart",
                data:{
                  _id: that.openid,
                  cart:[]
                }
              }).then(res=>{
                console.log(res)
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
      var cart = this.data.cart.miniCart.concat()
      var status = cart[index].status

      console.log(index)

      var price = floatObj.divide(cart[index].goods_price, cart[index].num,2)
      if( cart[index].num <= 1){
        this.setData({
          index
        })
        cart.splice(index,1)
          //没有积分商品了
          var isGeneration =  'cart.isGeneration'
         if(floatObj.subtract(this.data.cart.totalCredit , price,2) <= 0){
          this.setData({
            [isGeneration]:true,
            num:0
          })
         }
      }else{
          cart[index].goods_price = floatObj.subtract(cart[index].goods_price,price,2) 
          cart[index].num--
          this.setData({
            index,
            num:cart[index].num
          })
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
        [totalGoods]:--this.data.cart.totalGoods,
        status:1,
      })
      this.judgePrice()
      this.sychronData();

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


    var cart = this.data.cart.miniCart.concat()
    var price = floatObj.divide(cart[index].goods_price, cart[index].num,2)
    var status = cart[index].status

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
     return
    }
    if(!this.judgeOver(cart,index,price,status)) return

    cart[index].goods_price=floatObj.add(cart[index].goods_price,price,2)
    cart[index].num++
    var miniCart = 'cart.miniCart'
    var totalGoods = 'cart.totalGoods'
    var totalPrice = 'cart.totalPrice'
    var totalCredit = 'cart.totalCredit'
    if(status === 1){
      this.setData({
        [totalCredit]:floatObj.add(this.data.cart.totalCredit,price,2)
      })
    }else{
      this.setData({
        [totalPrice]:floatObj.add(this.data.cart.totalPrice,price,2)

      })
    }
    console.log("plus price " , price)
  
    this.setData({
      [miniCart]:cart,
      [totalGoods]:++this.data.cart.totalGoods,
      num:cart[index].num,
      status:2,
      index
    })
    this.judgePrice()

    this.sychronData();
   

    wx.cloud.callFunction({
      name:"updateUserCart",
  
      data:{
        _id: this.openid,
        cart
      }
    }).then(res=>{
      console.log(res)
    })
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
      //点击底部弹出，显示购物详情
  showDetail(){
    if(this.data.cart.totalGoods===0){
      return
    }
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
  },


})
