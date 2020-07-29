//app.js
const regeneratorRuntime = require('/utils/runtime.js')
App({
  //onLaunch,onShow: options(path,query,scene,shareTicket,referrerInfo(appId,extraData))
  onLaunch: function(options){
    this.globalData.priceMsg="差39元起送"
    this.globalData.minPrice="39"
    this.globalData.phoneNumber="13112371367"
    wx.cloud.init({
      env:"supermarket-2pc4d" ,
      traceUser:true
    });
    this.screenSize();
  const DB = wx.cloud.database();

    DB.collection('manager').where({
        _id:'1'
      }).get().then(res=>{
        console.log(res)
        console.log(res.data[0].close)
        this.globalData.closeStatus = res.data[0].close
      })
    let that = this
    wx.getSetting({
      success: (result)=>{
        const scopeUserInfo = result.authSetting["scope.userInfo"]
        console.log(scopeUserInfo)
        if(scopeUserInfo!=true){
          that.globalData.scopeUserInfo = false
        }else{
          that.globalData.scopeUserInfo = true

        }
        wx.setStorageSync("scopeUserInfo", scopeUserInfo);
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },
  screenSize: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        //可视窗口宽度
        var ww = res.windowWidth;
        //可视窗口高度
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
      }
    })
  },
  bezier2: function (cp, t) {
      var tPos = {}
               tPos.x = Math.pow((1-t),2)*cp[0].x+2*t*(1-t)*cp[1].x + Math.pow(t,2)*cp[2].x;
      tPos.y = Math.pow((1-t),2)*cp[0].y+2*t*(1-t)*cp[1].y + Math.pow(t,2)*cp[2].y;
      // return {
      //   'bezier_points': tPos
      // };
      return tPos;
},
     
   
  
  bezier1: function (points, times) {
    // 0、以3个控制点为例，点A,B,C,AB上设置点D,BC上设置点E,DE连线上设置点F,则最终的贝塞尔曲线是点F的坐标轨迹。
    // 1、计算相邻控制点间距。
    // 2、根据完成时间,计算每次执行时D在AB方向上移动的距离，E在BC方向上移动的距离。
    // 3、时间每递增100ms，则D,E在指定方向上发生位移, F在DE上的位移则可通过AD/AB = DF/DE得出。
    // 4、根据DE的正余弦值和DE的值计算出F的坐标。
    // 邻控制AB点间距
    var bezier_points = [];
    var points_D = [];
    var points_E = [];
    const DIST_AB = Math.sqrt(Math.pow(points[1]['x'] - points[0]['x'], 2) + Math.pow(points[1]['y'] - points[0]['y'], 2));
    // 邻控制BC点间距
    const DIST_BC = Math.sqrt(Math.pow(points[2]['x'] - points[1]['x'], 2) + Math.pow(points[2]['y'] - points[1]['y'], 2));
    // D每次在AB方向上移动的距离
    const EACH_MOVE_AD = DIST_AB / times;
    // E每次在BC方向上移动的距离 
    const EACH_MOVE_BE = DIST_BC / times;
    // 点AB的正切
    const TAN_AB = (points[1]['y'] - points[0]['y']) / (points[1]['x'] - points[0]['x']);
    // 点BC的正切
    const TAN_BC = (points[2]['y'] - points[1]['y']) / (points[2]['x'] - points[1]['x']);
    // 点AB的弧度值
    const RADIUS_AB = Math.atan(TAN_AB);
    // 点BC的弧度值
    const RADIUS_BC = Math.atan(TAN_BC);
    // 每次执行
    for (var i = 1; i <= times; i++) {
      // AD的距离
      var dist_AD = EACH_MOVE_AD * i;
      // BE的距离
      var dist_BE = EACH_MOVE_BE * i;
      // D点的坐标
      var point_D = {};
      point_D['x'] = dist_AD * Math.cos(RADIUS_AB) + points[0]['x'];
      point_D['y'] = dist_AD * Math.sin(RADIUS_AB) + points[0]['y'];
      points_D.push(point_D);
      // E点的坐标
      var point_E = {};
      point_E['x'] = dist_BE * Math.cos(RADIUS_BC) + points[1]['x'];
      point_E['y'] = dist_BE * Math.sin(RADIUS_BC) + points[1]['y'];
      points_E.push(point_E);
      // 此时线段DE的正切值
      var tan_DE = (point_E['y'] - point_D['y']) / (point_E['x'] - point_D['x']);
      // tan_DE的弧度值
      var radius_DE = Math.atan(tan_DE);
      // 地市DE的间距
      var dist_DE = Math.sqrt(Math.pow((point_E['x'] - point_D['x']), 2) + Math.pow((point_E['y'] - point_D['y']), 2));
      // 此时DF的距离
      var dist_DF = (dist_AD / DIST_AB) * dist_DE;
      // 此时DF点的坐标
      var point_F = {};
      point_F['x'] = dist_DF * Math.cos(radius_DE) - point_D['x'];
      point_F['y'] = dist_DF * Math.sin(radius_DE) - point_D['y'];
      bezier_points.push(point_F);
    }
    return {
      'bezier_points': bezier_points
    };
  },

  

/**

    * @param sx 起始点x坐标

    * @param sy 起始点y坐标

    * @param cx 控制点x坐标

    * @param cy 控制点y坐标

    * @param ex 结束点x坐标

    * @param ey 结束点y坐标

    * @param part 将起始点到控制点的线段分成的份数，数值越高，计算出的曲线越精确

    * @return 贝塞尔曲线坐标

   */

bezier: function (points, part) {

  let sx = points[0]['x'];
  
  let sy = points[0]['y'];
  
  let cx = points[1]['x'];
  
  let cy = points[1]['y'];
  
  let ex = points[2]['x'];
  
  let ey = points[2]['y'];
  
  var bezier_points = [];
  
  // 起始点到控制点的x和y每次的增量
  
  var changeX1 = (cx - sx) / part;
  
  var changeY1 = (cy - sy) / part;
  
  // 控制点到结束点的x和y每次的增量
  
  var changeX2 = (ex - cx) / part;
  
  var changeY2 = (ey - cy) / part;
  
  //循环计算
  
  for (var i = 0; i <= part; i++) {
  
  // 计算两个动点的坐标
  
  var qx1 = sx + changeX1 * i;
  
  var qy1 = sy + changeY1 * i;
  
  var qx2 = cx + changeX2 * i;
  
  var qy2 = cy + changeY2 * i;
  
  // 计算得到此时的一个贝塞尔曲线上的点
  
  var lastX = qx1 + (qx2 - qx1) * i / part;
  
  var lastY = qy1 + (qy2 - qy1) * i / part;
  
  // 保存点坐标
  
  var point = {};
  
  point['x'] = lastX;
  
  point['y'] = lastY;
  
  bezier_points.push(point);
  
  }
  
  //console.log(bezier_points)
  
  return {
  
  'bezier_points': bezier_points
  
  };
  
  },

  //获取openid顺序：globalData--云函数login
  getOpenidOnlyCloud: async function () {
    return this.globalData.openid = this.globalData.openid ||
     (await wx.cloud.callFunction({ name: 'login' })).result.OPENID
  },
  
  //获取openid顺序：globalData--storage--云函数login
  getOpenid: async function () {
    (this.globalData.openid = this.globalData.openid || wx.getStorageSync('openid')) || wx.setStorageSync('openid', this.globalData.openid = (await wx.cloud.callFunction({ name: 'login' })).result.OPENID)
    return this.globalData.openid
  },
  globalData: {
   index:0
  },
 

});