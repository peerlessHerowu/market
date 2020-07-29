function base62encode(v, n){
    // let codeStr = "0123456789"
      var ret = ""
      for(var i=0;i<n;i++){
        ret = codeStr[v%codeStr.length] + ret
        v = Math.floor(v/codeStr.length)
      }
      return ret
}
let codeStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function getId(){
    var ret = ''
    var ms = (new Date()).getTime()
    ret += base62encode(ms, 8) // 6923年循环一次
    ret += base62encode(Math.ceil(Math.random() * (62**6)), 6) // 冲突概率为每毫秒568亿分之一
    return ret
  }

  module.exports = {
      getId:getId
  }
