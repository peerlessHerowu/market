var area = require('../../utils/area.js');
var areaInfo = []; //所有省市区县数据
var provinces = []; //省
var provinceNames = []; //省名称
var citys = []; //城市
var cityNames = []; //城市名称s
var countys = []; //区县
var countyNames = []; //区县名称
var value = [0, 0, 0]; //数据位置下标
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
    address:''
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {

   this.openid = await app.getOpenid()

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


distance:0,
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
    // area.getAreaInfo(function(arr) {
    //   areaInfo = arr;
    //   //获取省份数据
    //   that.getProvinceData();
    // });
  },
  // 获取省份数据
  getProvinceData: function() {
    var that = this;
    var s;
    provinces = [];
    provinceNames = [];
    var num = 0;
    for (var i = 0; i < areaInfo.length; i++) {
      s = areaInfo[i];
      if (s.di == "00" && s.xian == "00") {
        provinces[num] = s;
        provinceNames[num] = s.name;
        num++;
      }
    }
    that.setData({
      provinceNames: provinceNames
    })

    that.getCityArr();
    that.getCountyInfo();
  },

  // 获取城市数据
  getCityArr: function(count = 0) {
    var c;
    citys = [];
    cityNames = [];
    var num = 0;
    for (var i = 0; i < areaInfo.length; i++) {
      c = areaInfo[i];
      if (c.xian == "00" && c.sheng == provinces[count].sheng && c.di != "00") {
        citys[num] = c;
        cityNames[num] = c.name;
        num++;
      }
    }
    if (citys.length == 0) {
      citys[0] = {
        name: ''
      };
      cityNames[0] = {
        name: ''
      };
    }
    var that = this;
    that.setData({
      citys: citys,
      cityNames: cityNames
    })
    console.log('cityNames:' + cityNames);
    that.getCountyInfo(count, 0);
  },

  // 获取区县数据
  getCountyInfo: function(column0 = 0, column1 = 0) {
    var c;
    countys = [];
    countyNames = [];
    var num = 0;
    for (var i = 0; i < areaInfo.length; i++) {
      c = areaInfo[i];
      if (c.xian != "00" && c.sheng == provinces[column0].sheng && c.di == citys[column1].di) {
        countys[num] = c;
        countyNames[num] = c.name;
        num++;
      }
    }
    if (countys.length == 0) {
      countys[0] = {
        name: ''
      };
      countyNames[0] = {
        name: ''
      };
    }
    console.log('countyNames:' + countyNames);
    var that = this;
    // value = [column0, column1, 0];

    that.setData({
      countys: countys,
      countyNames: countyNames,
      // value: value,
    })
  },

  bindTransportDayChange: function(e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);
    this.setData({
      transportIndex: e.detail.value
    })
  },

  bindProvinceNameChange: function(e) {
    var that = this;
    console.log('picker province 发生选择改变，携带值为', e.detail.value);
    var val = e.detail.value
    that.getCityArr(val); //获取地级市数据
    that.getCountyInfo(val, 0); //获取区县数据

    value = [val, 0, 0];
    this.setData({
      provinceIndex: e.detail.value,
      cityIndex: 0,
      countyIndex: 0,
      value: value
    })

  },

  bindCityNameChange: function(e) {
    var that = this;
    console.log('picker city 发生选择改变，携带值为', e.detail.value);

    var val = e.detail.value
    that.getCountyInfo(value[0], val); //获取区县数据
    value = [value[0], val, 0];
    this.setData({
      cityIndex: e.detail.value,
      countyIndex: 0,
      value: value
    })
  },

  bindCountyNameChange: function(e) {
    var that = this;
    console.log('picker county 发生选择改变，携带值为', e.detail.value);
    this.setData({
      countyIndex: e.detail.value
    })
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
    var address = e.detail.value.address;
   
    var addr = this.data.addr
    var title = this.data.title

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
    // console.log(transportDay + "," + provinceName + "," + cityName + "," + countyName + "," + address); //输出该文本 

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

            arr.unshift(addressList);
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
      wx.setStorageSync("choosedAddress",addressList);

      wx.navigateBack({
        delta: 2
      });

      arr.unshift(addressList);
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
