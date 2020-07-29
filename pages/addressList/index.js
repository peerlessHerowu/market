const DB = wx.cloud.database();
var app = getApp()
const regeneratorRuntime = require('../../utils/runtime.js')

Page({
  data: {
    inDistance:true,
    addressList:[],
  },

  edit(e){
    var index = e.currentTarget.dataset.index
    wx.setStorageSync("editIndex", index);
    wx.setStorageSync("locateAddress", this.data.addressList[index].title);
    wx.navigateTo({
      url: '/pages/addressEdit/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },

  add: function () {
   
  },

  onShow:  async function () {
    this.openid = await app.getOpenid()
    let that = this
    var arr = wx.getStorageSync('addressList') || [];
    console.info("缓存数据：" , arr);

    //来到这里，数据库是有地址信息的，用户清了缓存
    if(arr.length === 0){
      console.log("kong")
      wx.cloud.callFunction({
        name:'getUserInfo',
        data:{
          _id:that.openid
        }
       }).then(res=>{
          console.log(res)
          // 缓存没有有，重新加入缓存的，更新数据  
          arr = res.result.data[0].deliverAddress
          wx.setStorageSync("addressList", arr);
          that.setData({
            addressList: arr
          });
       })
    }else{
      // 缓存有，直接用缓存的，更新数据  
      this.setData({
        addressList: arr
      });
    }

  
      this.setData({
        inDistance:true
      })
    
    this.data.addressList.forEach(e=>{
      if(e.status === 0){
        this.setData({
          inDistance:false
        })
      }
    })
   
  },


  
  //点击其他地方这行组件弹回
  tap: function(e) {
    var index = e.currentTarget.dataset.index

    var x = "addressList[" + index + "].x";

    this.setData({
       [x]:0
    })
  //   // delete
  //   this.setData({
  //     [x]:undefined
  //  })
  },
  delete(e){
    var that = this
    wx.showModal({
      title: '提示',
      content: "确定要删除吗？",
      success: function (sm) {
        if (sm.confirm) {
          that.tap(e)
          var index = e.currentTarget.dataset.index

          that.data.addressList.splice(index,1)
          that.setData({
            addressList:that.data.addressList
          })
          wx.setStorageSync("addressList", that.data.addressList);
            that.setData({
              inDistance:true
            })
            that.data.addressList.forEach(e=>{
              if(e.status === 0){
                that.setData({
                  inDistance:false
                })
              }
           
          })
          wx.cloud.callFunction({
            name:'removeAddress',
            data:{
              _id:that.openid,
              deliverAddress:that.data.addressList
            }
           }).then(res=>{
             console.log(res)
           })
        } else if (sm.cancel) {
          wx.showToast({
            title: '已取消删除',
            icon: 'succes',
            duration: 1000,
            mask: true
          })
        }
      }
    });
  },

  addAddress:function(){
    wx.navigateTo({ url: '/pages/addAddress/index' });
  },

  chooseTheAddress(e){
    var index = e.currentTarget.dataset.index
    wx.setStorageSync("choosedAddress", this.data.addressList[index]);
    wx.navigateBack({
      delta: 1
    });
  },

  cantChoose(){
    wx.showModal({
      title: '超出配送范围',
      content: '该地点超出配送范围，请重新选择',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if(result.confirm){
          return
        }
      },
    });
  },
  // initLeft: function() {
  //   getApp().globalData.slideTask.forEach(value => {
  //     if (value != this) {
  //       value.setData({
  //         style: 'transform: translate(' + 0 + 'px, 0);transition:all 0.3s linear 0.01s',
  //         left0: 0
  //       })
  //     }

  //   })

  // },

  onTouchStart(event) {
    console.log(event.touches)

    const currentIndex = event.currentTarget.dataset.index

    this.data.addressList.forEach((v,i)=>{
      if(i != currentIndex){
       var x = "addressList[" + i + "].x";
 
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
      var x = "addressList[" + index + "].x";

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



})
