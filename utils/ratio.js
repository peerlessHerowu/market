function imageUtil(e) {
    var imageSize = {};
    var originalWidth = e.width;//图片原始宽  
    var originalHeight = e.height;//图片原始高  
    var originalScale = originalHeight / originalWidth;//图片高宽比  
    
    console.log('原始宽: ' + originalWidth)
    console.log('原始高: ' + originalHeight)
    console.log('宽高比' + originalScale)
    //获取屏幕宽高  
    wx.getSystemInfo({
      success: function (res) {
        // canvas 基础宽高调为 2 倍，避免图片压缩程度过高导致图片字体显示不清楚
        var windowWidth = res.windowWidth * 2;
        var windowHeight = res.windowHeight * 2;
        var windowscale = windowHeight / windowWidth;//屏幕高宽比  
        
        // 图片尺寸大于设备
        if (originalWidth > res.windowWidth || originalHeight > res.windowHeight) {
          if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比  
            //图片缩放后的宽为屏幕宽  
            imageSize.imageWidth = windowWidth;
            imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
          } else {//图片高宽比大于屏幕高宽比
            //图片缩放后的高为屏幕高  
            imageSize.imageHeight = windowHeight;
            imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
          }
        } else {
          imageSize.imageHeight = originalHeight;
          imageSize.imageWidth = originalWidth;
        }
      }
    })
    console.log('缩放后的宽: ' + imageSize.imageWidth)
    console.log('缩放后的高: ' + imageSize.imageHeight)
    return imageSize;
  }
  
module.exports = {
    imageUtil: imageUtil
  } 