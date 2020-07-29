var getIdUtil = require('../../utils/getId.js')
//引入发送请求的方法, 一定要把路径补全
import { request } from "../../request/index.js";

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
    //右侧滚动条距离顶部的距离
    scrollTop:0

  },

  //接口的返回数据
  Cates:[],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //小程序中存的时候没有做内存转换
    //获取本地存储中的数据
    const Cates = wx.getStorageSync("cates");
    if(!Cates){
      this.getClassifyData();
    }else{
      //数据没有过期就直接用
      if(Date.now() - Cates.time>1000*60*10){
        //数据过期就重新发送请求
        this.getClassifyData();
      }else{
        // console.log("old");
        this.Cates=Cates.data;

        //构造左侧的大菜单数据
        let leftMenuList = this.Cates.map(v=>v.cat_name);
        //构造右侧的商品数据
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },


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
        //构造右侧的商品数据
        let rightContent = that.Cates[0].children;
        that.setData({
          leftMenuList,
          rightContent
        })

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
    //构造右侧的商品数据
    let rightContent = this.Cates[index].children;
    
    this.setData({
      currentIndex:index,
      rightContent,
    //重新设置右侧内容的scroll-view标签距离顶部的距离
      scrollTop:0
    })

  },



  //加入购物车事件
  addShopCart(){
    console.log("add~")
  }
  
})