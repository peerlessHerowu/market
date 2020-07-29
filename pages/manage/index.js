var getIdUtil = require('../../utils/getId.js')
const regeneratorRuntime = require('../../utils/runtime.js')
const DB = wx.cloud.database();

// import util from "../util/util.js"; // 长宽比计算
// pages/manage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //自定义toast
    isShowToast:false,
    count:1000,
    toastText:'',


    //是否按销量排序：
    isSortBySell:false,
    isSortByPrice:false,
    sort:false,
    asc:true,
    desc:true,

    //弹出框，用以添加具体信息

    //添加类别
    showModalStatus1: false,
    //添加商品
    showModalStatus2: false,
    //移除类别
    showModalStatus3: false,
    //编辑商品
    showModalStatus4: false,

    //关店
    showModalStatus5: false,


    select: false,
    goods_name: '--请选择商品类别--',
    goods_category: [],
    // ['时令水果', '蔬菜肉菇', '肉蛋水产','乳制品','红配速食',
                    // '酒水冲调', '粮由调味', '休闲零食','湛江特产', '百货商品']
    // animationData:''

    //图片路径，用于预览
    imgUrl:"../../icons/noPicture.png",
    noneImg:"../../icons/noPicture.png",
    imgUrls:[],

    imgCount:0,

    cWidth: "",
    cHeight: "",
    imageSize: '',

    classifyName:'',
    classifyImgPath:'',
    // 存多张图片 
    classifyImgPaths:[],

    //是否隐藏 -号 按钮
    noImage:true,
    //图片超过九张不能再选
    isEnough:false,

    goodId:'',
    goodName:'',
    goodPrice:'',
    goodNum:'',
    goodDetail:'',
    goodsImgPath:'',


    //左侧菜单数据
    leftMenuList:[],
    //右侧菜单数据
    rightContent:[],


    //被点击的菜单
    currentIndex:0,
    //被点击的商品
    contentIndex:0,
    //右侧滚动条距离顶部的距离
    scrollTop:0,

    color:"#8a8a8a",
  },

  
  //下拉框
  bindShowMsg() {
    this.setData({
      select: !this.data.select
    })
  },
  mySelect(e) {
    // console.log(e)
    var name = e.currentTarget.dataset.name
    this.setData({
      goods_name: name,
      select: false
    })
    // console.log(this.data.goods_name)
  },

  //获得输入框内容
  classifyName:function(e){
    this.data.classifyName = e.detail.value;
    console.log(this.data.classifyName)
  },
  goodName: function(e){
    this.data.goodName = e.detail.value;
    console.log(this.data.goodName)
  },
  goodPrice: function(e){
    this.data.goodPrice = e.detail.value;
    console.log(this.data.goodPrice)
  },
  goodNum: function(e){
    this.data.goodNum = e.detail.value;
    console.log(this.data.goodNum)
  },
  goodDetail: function(e){
    this.data.goodDetail = e.detail.value;
    console.log(this.data.goodDetail)
  },
  coloseMarketInput:function(e){
    this.data.closeDetail = e.detail.value;
    console.log(this.data.closeDetail)
  },

  chooseClassifyImg(){
    var that=this;
    let filePath;
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      async  success(res) {
        console.log(res);
        // filePath = res.tempFilePaths[0];
       
        filePath = await that.compressImg(res.tempFilePaths[0])
       that.setData({
         imgUrl:filePath
       })
      },
    })

},

uoloadTheImg(){
  var that=this;
  wx.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    async success(res) {
      console.log(res);
      const filePath=res.tempFilePaths[0];
      
      //上传图片：这里我是要把文件上传到云存储管理的“images-roomType/此用户的open_id/”的文件夹下
      var cloudPath="轮播图/"+ new Date().getTime() +filePath.match(/\.[^.]+?$/)[0];  //count+".后缀", 如“0.png”
      console.log(cloudPath);
      wx.cloud.uploadFile({
        cloudPath:cloudPath,
        filePath:filePath,
        success:res=>{
          console.log("上传成功");
          console.log(res)
        }
      })
    },
  })
},
  size : 0,
  chooseImg(){
      var that=this;
      let filePath;
      wx.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
          
      }).then(res=>{
        console.log(res);
          that.isOpImg = true

          // filePath = res.tempFilePaths[0];
          let pathsArray = res.tempFilePaths; 
          let len = pathsArray.length
          // var imgUrls=that.data.imgUrls
    
          for (let i = 0; i < len; i++) {
              that.compressImg(pathsArray[i]).then(res=>{
                console.log(res)
                pathsArray[i] = res
              })
          }
          // pathsArray.forEach(element => {
          //     imgUrls.push(element)
          // });
          // that.setData({
          //   imgUrls
          // })

          wx.showToast({
            title: '正在上传...',
            icon: 'loading',
            mask: true,
            duration: 10000
          })
           //上传图片
           var cloudPath = [];
           //上传文件只能单个上传
           for (var i in pathsArray) {
             //获取数据库中图片数量count，通过“count.后缀”来添加图片保证图片不覆盖
             var url = "images-roomType/" + that.data.goods_name + "/" + Date.now() + pathsArray[i].match(/\.[^.]+?$/)[0];
            //  var url = "images-roomType/" + that.data.goods_name + "/" + Date.now() + '.jpg'
              //记录下云文件的位置
             wx.cloud.uploadFile({
               cloudPath: url,
               filePath: pathsArray[i],
             }).then(res2=>{
              console.log("res2",res2)//成功后控制台打印
              cloudPath.push(res2.fileID);    //记录下云文件的位置
              that.setData({    
                imgUrls:cloudPath,  
                classifyImgPaths:cloudPath
               })  
              wx.showToast({
                title: '上传成功',
                icon: 'succes',
                duration: 1000,
                mask: true
              })
              that.flag = true;
             })
           }
             
      })
  
  },

  deleteImgs :[],
//取消选择图片
  noSelectImg(e){
    this.isOpImg = true
    var index =  e.currentTarget.dataset.index
    var imgUrls=this.data.imgUrls

    this.deleteImgs.push(this.data.imgUrls[index])
    imgUrls.splice(index,1)

    this.setData({
      imgUrls
    })


   
  },
  //暂时不用
  noneImg(){
    this.setData({
      imgUrl:""
    })
  },


  flag:false,
  isOpImg:false,

  //有相同商品
  haveSameGoods: false,
  //上传图片，并标志是否已经上传


  //压缩并获取图片，这里用了递归的方法来解决canvas的draw方法延时的问题
  getCanvasImg: function (index,failNum, tempFilePaths){
    var that = this;
    wx.getImageInfo({
      // src: tempFilePaths[index],// 用于多个图片压缩
      src: tempFilePaths[0], //图片的路径，可以是相对路径，临时文件路径，存储文件路径，网络图片路径,  
      success: res => {
        // console.log(res)
        // util.imageUtil  用语计算长宽比
        var imageSize = util.imageUtil(res);
        console.log(imageSize)
        that.imageSize = imageSize;

        if (index < tempFilePaths.length){
          const ctx = wx.createCanvasContext('attendCanvasId');
          setTimeout(() => {
            ctx.drawImage(tempFilePaths[index], 0, 0, imageSize.imageWidth, imageSize.imageHeight);
            ctx.draw(true, function () {
              index = index + 1;//上传成功的数量，上传成功则加1
              wx.canvasToTempFilePath({
                canvasId: 'attendCanvasId',
                success: function success(res) {
                  that.uploadCanvasImg(res.tempFilePath);
                  // that.getCanvasImg(index,failNum,tempFilePaths); // 用于多个图片压缩
                }, fail: function (e) {
                  failNum += 1;//失败数量，可以用来提示用户
                  that.getCanvasImg(inedx,failNum,tempFilePaths);
                }
              });
            });
          }, 1000);
        }
      },
      fail: () => {},
      complete: () => {}
    });
  },
    // 压缩功能  参数说明：图片的路径、
  async compressImg(photoSrc, ratio = 2, limitNum=380) {
    let that=this;
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: photoSrc,
        success(res) {
          var canvasWidth = res.width //图片原始长宽
          var canvasHeight = res.height
          console.log('图片的基本信息', res)
          while (canvasWidth > limitNum || canvasHeight > limitNum) {// 保证宽高在400以内
            canvasWidth = Math.trunc(res.width / ratio)
            canvasHeight = Math.trunc(res.height / ratio)
            ratio++;
          }
          that.setData({
            cWidth: canvasWidth,
            cHeight: canvasHeight
          })
          //----------绘制图形并取出图片路径--------------
          var ctx = wx.createCanvasContext('canvas')
          ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
          ctx.draw(false, setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: 'canvas',
              destWidth: canvasWidth,
              destHeight: canvasHeight,
              success: function (res) {
                console.log(res)//最终图片路径
                resolve(res.tempFilePath)
                
              },
              fail: function (res) {
                console.log("fail1"+res.errMsg)
              }
            })
          }, 100))
        },
        fail: function (res) {
          console.log("fail--"+res.errMsg)
        },
      })
    })
  },

  //获得类名
  getCategoryName(){
    let that = this
    // this.setData({
    //   goods_name : "--请选择商品类别--"
    // })
    DB.collection('goods_classify').get().then(res=>{
      //把接口数据存入本地存储中
      // wx.setStorageSync("cates", {time:Date.now(),data:res.data});
      var len = res.data.length
      var goods_category;
     for (let i = 0; i < len; i++) {
        goods_category = "goods_category[" + i + "]"
        that.setData({
          [goods_category] : res.data[i].cat_name
        })
      }
     
    })
  },

  flusPage:function(){
    // this.setData({
    //  leftMenuList:[],
    //  rightContent:[]
    // })
    this.getClassifyData(this.data.currentIndex)
  },
 
// 添加分类
  addCategory(e){
    var currentStatus = e.currentTarget.dataset.status;

    // console.log(currentStatus)
    this.util(currentStatus)
   
  },

  //删除分类
  removeCategory(e){
    this.setData({
      goods_name: '--请选择商品类别--',
     })
   this.getCategoryName();
    var currentStatus = e.currentTarget.dataset.status;

    // console.log(currentStatus)
    this.util(currentStatus)
  } ,

  //删除商品
  removeGoods(e){
    let that = this
    var index = e.currentTarget.dataset.index;
    this.setData({
      goodName:this.data.rightContent[index].goods_name,
    })
    
    wx.showModal({
      title: '提示',
      content: "确定要删除商品 "+ this.data.goodName+" 吗？",
      success: function (sm) {
         var goods_name =  that.data.rightContent[index].goods_name
        
          if (sm.confirm) {
            wx.showToast({
              title: '正在删除',
              icon: 'loading',
              duration: 1000,
              mask: true
            })
            DB.collection("goods_detail").where({
              goods_name:goods_name
            }).get().then(res=>{
              console.log(res)
              that.deleteImgs = res.data[0].goods_pics,
              
              wx.cloud.deleteFile({
                fileList: that.deleteImgs
              }).then(res => {
                that.removeGood();
               })
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
      })
  },
  //编辑商品
  updateGoods(e){
    let that = this
    var currentStatus = e.currentTarget.dataset.status;
    var index = e.currentTarget.dataset.index;

    //回显图片
    var goods_name =  this.data.rightContent[index].goods_name
    DB.collection("goods_detail").where({
      goods_name:goods_name
    }).get().then(res=>{
      console.log(res)
      that.setData({
        imgUrls : res.data[0].goods_pics,
      })
      that.setData({
        contentIndex:index,
        classifyImgPaths:this.data.imgUrls,
        classifyImgPath:this.data.rightContent[index].goods_icon,
        // goods_name: this.data.leftMenuList[this.data.currentIndex],
        goodName:goods_name,
        goodPrice:this.data.rightContent[index].goods_price,
        goodNum:this.data.rightContent[index].goods_num,
        goodDetail:res.data[0].goods_detail || '' 
      })
      console.log(this.data.imgUrls)
      console.log(this.data.classifyImgPaths)
    })
   

    //回显数据


    // console.log(currentStatus)
    this.util(currentStatus)
  },

  //观点信息
  handleCloseMarket(e){
    var currentStatus = e.currentTarget.dataset.status;
    this.util(currentStatus)
  },

  recover(){
    this.setData({
      imgUrls:[],
      classifyImgPaths:[],
      classifyImgPath:[],
      deleteImgs:[],
      goodName:'',
      goodPrice:'',
      goodNum:'',
      goodDetail:'',
    })
  },
  //添加新的商品
  addGoods(e){
    this.getCategoryName();
    // console.log("add")
    var currentStatus = e.currentTarget.dataset.status;
    this.util(currentStatus)
   
  },  


  isNull( str ){
    if ( str == "" ) return true;
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return re.test(str);
  },

  util: function(currentStatus) {
    let that = this
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation = wx.createAnimation({
      duration: 200, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;

    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function() {
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      this.setData({
        animationData: animation
      })
      //关闭  
      if (currentStatus == "cancel_close") {
        this.setData({
          showModalStatus5: false
        });
        wx.showToast({
          title: '已取消关店',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
      }
      if (currentStatus == "cancel_c") {
        this.setData({
          showModalStatus1: false
        });
        
        wx.showToast({
          title: '已取消添加',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
        this.recover()

      }
      if (currentStatus == "cancel_m") {
        this.setData({
          showModalStatus2: false
        });
        
        wx.showToast({
          title: '已取消添加',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
        this.recover()

      }
      //移除分类
      if (currentStatus == "cancel_r") {
        this.setData({
          showModalStatus3: false
        });
        
        wx.showToast({
          title: '已取消移除',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
        this.recover()

      }
      if (currentStatus == "cancel_update") {
        this.setData({
          showModalStatus4: false
        });
        
        wx.showToast({
          title: '已取消更新',
          icon: 'succes',
          duration: 1000,
          mask: true
        })
        this.recover()

      }
      //确定添加新类
      if (currentStatus == "confirm_closeMarket") {
        wx.showToast({
          title: '正在关店',
          icon: 'loading',
          duration: 1000,
          mask: true
        })     
        console.log('关店--',that.data.closeDetail)
       wx.cloud.callFunction({
         name:'closeMarket',
          data:{
            close:true,
            closeMsg:that.data.closeDetail
          }
        }).then(res=>{
          console.log(res)
          wx.showToast({
            title: '已关店',
            icon: 'success',
            duration: 1000,
            mask: true
          }).then(res=>{
            this.setData({
              showModalStatus5: false
            });
          }) 
          
        })
      
      }
      //确定添加新类
      if (currentStatus == "confirm_c") {

        if(that.data.classifyName == ''){
          this.setData({
          count: 2500,
          toastText: "您还有些内容没有填写哦~"
        });
        this.showToast();
        return
        }
        if(that.data.imgUrl== '../../icons/noPicture.png'){
          this.setData({
          count: 3500,
          toastText: "建议您选择图片呢~"
        });
        this.showToast();
        }
      
        wx.showToast({
          title: '正在添加',
          icon: 'loading',
          duration: 1000,
          mask: true
        })


        wx.cloud.uploadFile({//调用上传文件函数，这些在小程序开发文档中有
          cloudPath: new Date().getTime() + '.png',//照片上传到云存储的自定义名称路径
          filePath:that.data.imgUrl,
        }).then(res2 => {//调用成功后的的箭头函数
          console.log(res2.fileID)//成功后控制台打印
          that.setData({
            classifyImgPath: res2.fileID
          });
          //上传成功后，
          //根据条件查找到对应的记录后，(因为访问数据库是异步的)
          //存入数据库
          that.addNewClassify();
        }).catch(err2 => {
          that.addNewClassify();
        })
        
       
      }
      //确定移除分类
      if (currentStatus == "confirm_r"){
        if(that.data.goods_name=="--请选择商品类别--"){
         
          this.setData({
          count: 1500,
          toastText: "您还没有选择商品所属类别哦~"
        });
        this.showToast();
        return
      }
      

        wx.showModal({
          title: '提示',
          content: '确定要删除吗？',
          success: function (sm) {
              if (sm.confirm) {
                wx.showToast({
                  title: '正在删除',
                  icon: 'loading',
                  duration: 1000,
                  mask: true
                })
               that.removeClassify();
              
              } else if (sm.cancel) {
                wx.showToast({
                  title: '已取消删除',
                  icon: 'succes',
                  duration: 1000,
                  mask: true
                })
                console.log('用户点击取消')
              }
            }
          })
      }
      //确定添加新的商品
      if (currentStatus == "confirm_m") {
        if(that.data.goods_name==="--请选择商品类别--"){
         
            this.setData({
            count: 1500,
            toastText: "您还没有选择商品所属类别哦~"
          });
          console.log('')

          this.showToast();
          return
        }
        if(that.data.goodName === '' || 
        that.data.goodPrice ==='' ||
        that.data. goodNum === '' ||
        that.data. goodDetail === ''){
          this.setData({
          count: 2500,
          toastText: "您还有些内容没有填写哦~"
        });
        this.showToast();
        return
        }

        if(that.data.imgUrls.length == 0){
          this.setData({
          count: 3000,
          toastText: "建议您选择图片呢~"
        });
        this.showToast();
        
        }
  
        wx.showToast({
          title: '正在添加',
          icon: 'loading',
          duration: 1000,
          mask: true
        }) 
        //上传成功后，
        //根据条件查找到对应的记录后，(因为访问数据库是异步的)
        //存入数据库
        this.addNewGoods()
      }   
      
      //确定修改商品
      if(currentStatus == "confirm_update"){
        if(that.data.goods_name==="--请选择商品类别--"){
         
          this.setData({
          count: 1500,
          toastText: "您还没有选择商品所属类别哦~"
        });
        this.showToast();
        return
      }
      console.log('goodNum',that.data.goodDetail)
        if(that.data.goodName === '' || 
        that.data.goodPrice === '' ||
        that.data.goodNum ==='' ||
        that.data.goodDetail === ''){
          this.setData({
          count: 2500,
          toastText: "您还有些内容没有填写哦~"
        });
        this.showToast();
        return
        }
        if(that.data.imgUrls.length===0){
          this.setData({
          count: 3000,
          toastText: "建议您选择图片呢~"
        });
        this.showToast();
        
        }
        this.setData({
          classifyImgPaths:this.data.imgUrls,
        })
        wx.cloud.deleteFile({
          fileList: this.deleteImgs
        }).then(res => {
          // handle success
          console.log(res.fileList)
         
          this.updateGood()
        }).catch(error => {
          // handle error
        })
        wx.showToast({
          title: '正在更新',
          icon: 'loading',
          duration: 1000,
          mask: true
        })
        

        
      }

    }.bind(this), 200)
    // 显示  
    if (currentStatus == "close_market") {
      this.setData({
        showModalStatus5: true
      });
    }
    // 显示  
    if (currentStatus == "open_c") {
      this.setData({
        showModalStatus1: true
      });
    }
    if (currentStatus == "open_m") {
      this.setData({
        showModalStatus2: true
      });
    }
    if (currentStatus == "open_r") {
      this.setData({
        showModalStatus3: true
      });
    }
    if (currentStatus == "open_update") {
      this.setData({
        showModalStatus4: true
      });
    }
  },

  successAddAndCancel1(){
    this.setData({
      showModalStatus1: false
    });       
    wx.showToast({
      title: '添加成功',
      icon: 'succes',
      duration: 1000,
      mask: true
    })
  },
  successAddAndCancel2(){
    this.setData({
      showModalStatus2: false
    });       
    wx.showToast({
      title: '添加成功',
      icon: 'succes',
      duration: 1000,
      mask: true
    })
  },
  successAddAndCancel3(){
    this.setData({
      showModalStatus3: false
    });       
    wx.showToast({
      title: '删除成功',
      icon: 'succes',
      duration: 1000,
      mask: true
    })
  },
  successAddAndCancel4(){
    this.setData({
      showModalStatus4: false
    });       
    wx.showToast({
      title: '更新成功',
      icon: 'succes',
      duration: 1000,
      mask: true
    })
  },


  
  //新增商品类别
  addNewClassify(){
    let that = this

    wx.cloud.callFunction({
      name :"addGoodsClassify",
     
      data:{
        _id:getIdUtil.getId(),
        cat_icon: that.data.classifyImgPath,
        cat_id:getIdUtil.getId(),
        cat_name: that.data.classifyName,
        children:[]
      },
      success(res){
         that.successAddAndCancel1();
          //添加完后刷新页面
        that.flusPage()
        that.recover()

        // console.log("yunget成功", res.result.data)
        console.log("yunupdateData成功", res)
      },
      fail(res){
        console.log("yunupdateData失败",res)
      }
    })
  },

  //移除商品类别
  removeClassify(){
    let that = this
   
    wx.cloud.callFunction({
      name :"removeGoodsClassify",
     
      data:{
        cat_name:that.data.goods_name
      },
      success(res){
        that.successAddAndCancel3();
        that.flusPage()

        that.setData({
         goods_name: '--请选择商品类别--',
         goods_category:[]
        })
        // that.getCategoryName()
        this.recover()

        console.log("移除成功", res)
      },
      fail(res){
        console.log("yunupdateData失败",res)
      }
    })
    
  },

  // 删除商品
  removeGood(){
    let that = this
    let removeGoodName = that.data.goodName
    DB.collection("goods_classify").where({
      cat_name:that.data.leftMenuList[that.data.currentIndex]
    }).get().then(res=>{
      wx.cloud.callFunction({
        name :"removeGood",
       
        data:{
          goods_name:removeGoodName,
          _id:res.data[0]._id
        },
        success(res){
          that.successAddAndCancel3();
          that.flusPage()
          that.recover()
        },
        fail(res){
          console.log("yunupdateData失败",res)
        }
      })
      
    })
    DB.collection("goods_detail").where({
      goods_name:removeGoodName
    }).get().then(res=>{
      console.log(res)
      wx.cloud.callFunction({
        name :"removeGoodDetail",
        data:{
          _id:res.data[0]._id,
        }

      })
    })
   
  },
  //更新商品
  updateGood(){
    let that = this

  //0、普通商品
    //1、积分商品
    var  status = that.data.goods_name === '积分商品' ? 1 : 0;
    console.log('删除后2',this.data.imgUrls)
    console.log('删除后2',this.data.classifyImgPaths[0])
    wx.cloud.callFunction({
      name:"updateGood",
      data:{
        cat_name: that.data.goods_name,//类别  
        index:that.data.contentIndex,

        status:status,

        //同一个变量
        goods_icon:that.data.classifyImgPaths[0] || '',
        goods_name:that.data.goodName,
        goods_price:that.data.goodPrice,
        goods_num:that.data.goodNum,
        // goods_detail:that.data.goods_detail
      }
    }).then(res=>{
    
    })
    wx.cloud.callFunction({
      name:"updateGoodDetail",
      data:{
        status:status,
        //同一个变量
        goods_icon:that.data.classifyImgPaths,
        goods_name:that.data.goodName,
        goods_price:that.data.goodPrice,
        goods_num:that.data.goodNum,
        goods_detail:that.data.goodDetail
      }
    }).then(res=>{
      that.successAddAndCancel4();
      that.flusPage()
      that.recover()
      console.log(res)
    })
   
   
   
  },
  //添加新的商品(操作两个表)
  addNewGoods(){
    let that = this
    console.log("laile")
    DB.collection('goods_classify').where({
      cat_name: that.data.goods_name,//类别
    }).get().then(res=>{
        let len = res.data[0].children.length
        let goods = res.data[0].children
        for (let index = 0; index < len; index++) {
          if(goods[index].goods_name === that.data.goodName){
            this.haveSameGoods = true
            console.log(goods[index].goods_name)
            this.setData({
              count: 2000,
              toastText: "已经存在同名商品了亲~"
            });
            this.showToast();
            return
          }
        }

        //0、普通商品
        //1、积分商品
       var  status = that.data.goods_name === '积分商品' ? 1 : 0;

        that.data.goodId = res.data[0]._id
        wx.cloud.callFunction({
          name :"addGoods",
        
          data:{
            // id: "8GxZBP9j7pFrDbCvJs2x7DdhNVRQsjvZkNpMfUiPgRYurIQt",//类别
            _id:getIdUtil.getId(),
            id: res.data[0]._id,//类别
            cat_name:that.data.goods_name,

            status:status,

            goods_icon:that.data.classifyImgPaths,
            goods_id:getIdUtil.getId(),
            goods_name:that.data.goodName,
            goods_price:that.data.goodPrice,
            goods_num:that.data.goodNum,
            goods_detail:that.data.goodDetail,
            goods_sales_volumn:0
          },
          success(res){
            that.successAddAndCancel2();
            that.flusPage()
            that.recover()
            console.log("yunupdateData成功", res)
          },
          fail(res){
            console.log("yunupdateData失败",res)
          }
        })
      
    }).catch(err2 => {
      console.log(err2)
    })
   
  },
  closeMarket(){
    console.log('gaun')
    wx.cloud.callFunction({
      name:'closeMarket',
      data:{
        close:true
      }
    }).then(res=>{
      wx.showToast({
        title: '已关店',
        icon: 'success',
      });
    })
  },
  openMarket(){
    console.log('gaun')
    wx.cloud.callFunction({
      name:'closeMarket',
      data:{
        close:false
      }
    }).then(res=>{
      wx.showToast({
        title: '已开店',
        icon: 'success',
      });
    })
  },
  tempRight:[],
  sortBySalesVolume(){
    
    var isSortBySell = !this.data.isSortBySell

    var rightContent
    if(isSortBySell){
      rightContent = this.data.rightContent.sort((a,b)=>{
        return b['goods_sales_volumn'] - a['goods_sales_volumn']
      })
      this.setData({
        isSortBySell,
        rightContent,
        isSortByPrice:false,
        sort:false,
        asc:true,
        desc:true,
      })
    }else{
      var r = this.tempRight.concat()
      this.setData({
        isSortBySell,
        rightContent:r
      })
    }
  },

  sortByPrice(){

    var rightContent;
    if(!this.data.sort){
      rightContent = this.data.rightContent.sort((a,b)=>{
        return a['goods_price'] - b['goods_price']
      })
    
      this.setData({
        rightContent,
        sort:true,
        asc:false,
        isSortByPrice:true,
        isSortBySell:false,

      })
    }
    else if(!this.data.asc){
      rightContent = this.data.rightContent.sort((a,b)=>{
        return b['goods_price'] - a['goods_price']
      })
      this.setData({
        asc:true,
        desc:false,
        isSortByPrice:true,
        isSortBySell:false,
        rightContent
      })
    }
    else if(!this.data.desc){
      var r = this.tempRight.concat()
      this.setData({
        desc:true,
        sort:false,
        isSortByPrice:false,
        rightContent:r,
      })
    }
  },

  onPullDownRefresh: function () {
    // this.setData({
    //   currentIndex:0
    // })
    this.getClassifyData(this.data.currentIndex)
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

   //接口的返回数据
   Cates:[],

 /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options){

    this.getClassifyData(0)
 },


   //获取分类数据
  getClassifyData(currentIndex){
    let that = this;
    wx.cloud.callFunction({
      name :"giveCloudData",
      success(res){
        console.log("yunget成功", res.result.data)
        // console.log("yunAdd成功")
        that.Cates=res.result.data;

        //把接口数据存入本地存储中
        // wx.setStorageSync("cates", {time:Date.now(),data:that.Cates});


       //构造左侧的大菜单数据
        let leftMenuList = that.Cates.map(v=>v.cat_name);
        //构造右侧的商品数据
        let rightContent = that.Cates[currentIndex].children.concat();
        that.tempRight = rightContent.concat()

       
        that.setData({
          leftMenuList,
          rightContent
        })
        that.setData({
          goods_name:that.data.leftMenuList[0],
        })
      wx.stopPullDownRefresh(); 

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
    console.log(index)
    //构造右侧的商品数据
    let rightContent = this.Cates[index].children.concat();
    this.tempRight = rightContent.concat()

    //用户如果选了销量或价格排序就需要直接加载排序后的结果
    //1、如果点了按销量排序
    if(this.data.isSortBySell){
      rightContent = rightContent.sort((a,b)=>{
        return b['goods_sales_vlolum'] - a['goods_sales_vlolum']
      })
      console.log('rightContent1111',rightContent)
    }
    //1、如果点了按价格排序
    else if(!this.data.asc){
      rightContent = rightContent.sort((a,b)=>{
        return a['goods_price'] - b['goods_price']
      })
      console.log('rightConten222',rightContent)

    }
    else if(!this.data.desc){
      rightContent = rightContent.sort((a,b)=>{
        return b['goods_price'] - a['goods_price']
      })
      console.log('rightContent333',rightContent)

    }
    this.setData({
      rightContent,
      currentIndex:index,
      goods_name:this.data.leftMenuList[index],
      //重新设置右侧内容的scroll-view标签距离顶部的距离
        scrollTop:0
    })
    console.log(this.Cates[index].children)
    
   

  },
 
})