var addressList = null;
const regeneratorRuntime = require('../../utils/runtime.js')
var getDistance = require('../../utils/getDistance.js')

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
    
    addr:'',
    title:'',
    address:'',
    consignee:'',
    mobile:'',
    
  },


  title :'',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {

   this.openid = await app.getOpenid()
   var editIndex = wx.getStorageSync("editIndex");
   var addressList = wx.getStorageSync("addressList")[editIndex];  
   this.title = addressList.title
   this.setData({
     consignee:addressList.consignee,
     mobile:addressList.mobile,
      title:addressList.title,
      address:addressList.address
   })
    console.log(options)
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


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;

    var locateAddress = wx.getStorageSync("locateAddress");

    this.setData({
      addr:locateAddress.addr,
      title:locateAddress.title,
    })
    //在所有内容都填写完成后，判断所写的收获距离是否合法
    var choosedLatitude = locateAddress.latitude
    var choosedLongtitude = locateAddress.longitude
    var marketLatitude =  23.247617
    var marketLongitude= 113.357111
    console.log(choosedLatitude,choosedLongtitude,marketLatitude,marketLongitude)
    var distance = getDistance.getDistance(choosedLatitude,choosedLongtitude,marketLatitude,marketLongitude);
    console.log(distance)
    this.distance = distance
    
  },

  isNull( str ){
    if ( str == "" ) return true;
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return re.test(str);
  },


  toGetAddress(){
    console.log("on")
    wx.navigateTo({
      url: '/pages/addressChoose/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },
  
  saveAddress: function(e) {
    var that = this
    var consignee = e.detail.value.consignee;
    var mobile = e.detail.value.mobile;
    var address = e.detail.value.address;//门牌号
   
    var addr = this.data.addr 
    var title = this.data.title

    console.log(title.replace(/^\s*|\s*$/g,""))
    // 没有修改直接返回
    if(this.title === title.replace(/^\s*|\s*$/g,"") &&
    this.data.address === address.replace(/^\s*|\s*$/g,"") &&
    this.data.consignee === consignee.replace(/^\s*|\s*$/g,"")&&
    this.data.mobile === mobile.replace(/^\s*|\s*$/g,"")){
      wx.navigateBack({
        delta: 1
      });
      return
    }
    console.log(title.replace(/^\s*|\s*$/g,""))

    var toastText = '';
    if(addr === '' || this.isNull(consignee)){
      this.setData({
        count: 1000,
        toastText: "请您选择地址~"
      });
      this.showToast();
      return
    }
    if(consignee === '' || mobile === '' || address === ''){
      if(consignee === '' || this.isNull(consignee)){
         toastText += "收件人 "
      }  
      if(mobile === '' || this.isNull(mobile)){
        toastText += "手机号 "
      }
      if(address === '' || this.isNull(address)){
        toastText += "门牌号"
      }
      this.setData({
          count: 2000,
          toastText: "请您填写"+ toastText + "~"
        });
        this.showToast();
        return
    }
    
   var editIndex = wx.getStorageSync("editIndex");

    if(this.distance > 2){
      wx.showModal({
        title: '提示',
        content: '该距离超出商家配送范围，确认添加吗?',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: 'rgb(18,150,219)',
        success: (result) => {
          if(result.confirm){
            var arr = wx.getStorageSync('addressList') || [];
            console.log("arr,{}", arr);
            addressList = {
              consignee: consignee,
              mobile: mobile,
              addr:addr,
              title:title,
              address: address,
              status:0,
              distance:that.distance
            }
            wx.navigateBack({
              delta:1
            });

            arr.splice(editIndex,1,addressList);
            wx.setStorageSync('addressList', arr);

            wx.cloud.callFunction({
              name:"updateAddress",
              data:{
                _id:this.openid,
                addressList:addressList
              }
            }).then(res=>{
              console.log(res)
            })
          }else{
            return
          }
        },
      });
    }else{
      var arr = wx.getStorageSync('addressList') || [];
      console.log("arr,{}", arr);
      addressList = {
        consignee: consignee,
        mobile: mobile,
        addr:addr,
        title:title,
        address: address,
        status:1,
        distance:that.distance
      }
      console.log("--",addressList)
      wx.setStorageSync("choosedAddress",addressList);

      wx.navigateBack({
        delta: 1
      });
      arr.splice(editIndex,1,addressList);
      wx.setStorageSync('addressList', arr);

      wx.cloud.callFunction({
        name:"updateAddress",
        data:{
          _id:this.openid,
          addressList:addressList
        }
      }).then(res=>{
        console.log(res)
      })
    }
  }
})
