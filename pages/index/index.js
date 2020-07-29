//Page Object
var getIdUtil = require('../../utils/getId.js')
const DB = wx.cloud.database();
Page({
  data: {
    cat_name_icon:[],
    slideshow:[],
    recommandShow:[],

    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false, //“没有数据”的变量，默认false，隐藏
  },

  currentPage : 0, // 当前第几页,0代表第一页 
  pageSize : 20, //每页显示多少数据 
  onLoad(){
    var slideshow = []
    slideshow.push("cloud://supermarket-2pc4d.7375-supermarket-2pc4d-1302433998/轮播图/轮播图1.jpg")
    this.setData({
      slideshow
    })
    wx.cloud.callFunction({
      name :"getClasssfyMsg",
    }).then(res=>{
      var cat_name_icon =[]
      res.result.data.forEach(element => {
        if(element.cat_name==='积分商品')return
        var cat = {'cat_name':element.cat_name,'cat_icon':element.cat_icon}
        cat_name_icon.push(cat)
      });
      this.setData({
        cat_name_icon
      })
      console.log(cat_name_icon)
    })

    this.getRecommandGoods()
    wx.stopPullDownRefresh();
   
  },


  getRecommandGoods(){
     var that = this

      //第一次加载数据
      if (this.currentPage == 1) {
        this.setData({
          loadMore: true, //把"上拉加载"的变量设为true，显示  
          loadAll: false //把“没有数据”设为false，隐藏  
        })
      }
        //根据销量获得商品
      wx.cloud.callFunction({
        name:'getRecommandGoods',
        data:{
          currentPage:this.currentPage , //从第几个数据开始
          pageSize:this.pageSize
        }
      }).then(res=>{
        console.log(res)
        if (res.result.data && res.result.data.length > 0) {
          console.log("请求成功", res.result.data)
          that.currentPage++
          var recommandShow = res.result.data
          
          console.log(recommandShow)
          //把新请求到的数据添加到dataList里  
          recommandShow = that.data.recommandShow.concat(recommandShow)
          that.setData({
            recommandShow, //获取数据数组    
            loadMore: false //把"上拉加载"的变量设为false，显示  
          });
          if (recommandShow.length < that.pageSize) {
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
        that.getRecommandGoods()
      }, 2000)
    }
  },

  //跳转到商品分类
  toShowGoods(e){

    wx.setStorageSync("fromOne", true);
    const {index} = e.currentTarget.dataset
   getApp().globalData.index= index 
    wx.switchTab({
      url: '/pages/category/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },

  onPullDownRefresh(){
    this.onLoad();
  }


});