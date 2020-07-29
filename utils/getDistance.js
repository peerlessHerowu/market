function Rad(d){
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
 }
   // 计算距离
   function  getDistance(lat1, lng1, lat2, lng2) {

    var radLat1 = Rad(lat1);
    var radLat2 = Rad(lat2);
    var a = radLat1 - radLat2;
    var  b = Rad(lng1) - Rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    //s=s.toFixed(4);
    return s;

  }
  function getDistance1(lat1,lon1, lat2, lon2){
          var radLat1 = lat1*Math.PI / 180.0;
          var radLat2 = lat2*Math.PI / 180.0;
          var a = radLat1 - radLat2;
          var b = lon1*Math.PI / 180.0 - lon2*Math.PI / 180.0;
          var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
          Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
          s = s *6378.137 ;// EARTH_RADIUS;
          s = Math.round(s * 10000) / 10000;
          return s;
  }
  module.exports = {
    getDistance:getDistance
}



    // lat1 = lat1 || 0;

    // lng1 = lng1 || 0;

    // lat2 = lat2 || 0;

    // lng2 = lng2 || 0;

    // var rad1 = lat1 * Math.PI / 180.0;

    // var rad2 = lat2 * Math.PI / 180.0;

    // var a = rad1 - rad2;

    // var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

    // var r = 6378137;

    // return (r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))).toFixed(0)
