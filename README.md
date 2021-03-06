# market

## 项目介绍

　　基于云开发的微信小程序，实现了超市商品挑选、购买、下单、积分兑换等流程，支付功能暂未实现，采用的是货到付款，购买商品时也会对商品库存进行检查。另外也集成了后台商品和订单的管理。  
　　此项目本来针对真实情况写的，所以此项目的功能还算比较完善。（虽然后来由于种种原因没有真正上线。）　　
　　写这个小程序我也是参考官方文档加之各种途径之后完成的，许多方面也还有待完善。如果有什么自己的见解希望可以互相交流一下。（wx:shuaidiege）

## 项目架构
　　使用原生开发，WXML+Less+JS，服务器端基于Node.js环境

## 项目内容
### 首页
- 包括轮播图、食品分类列表和热门推荐
- 点击热门推荐的商品将进入商品详情界面，在这里可以查看商品详情，并购买商品。
- 通过一个函数，利用起点、最高点和终点，计算贝塞尔曲线，显示一个点击‘+’后商品进入购物车组建的动态效果。
- 如果购买价格达到起送费，则跳转至结算页面，否则可以点击‘去凑单’，凑够起送费。
 ![IMG_0894.GIF](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghg43e09trg30ch0m6x6s.gif)

### 分类
- 这里可以通过选择不同的分类查看不同的商品。同时可以根据销量或价格进行商品的排序
- 点击购物测组件可以显示已经购买的商品详情。

![IMG_0915.GIF](http://ww1.sinaimg.cn/large/006Ri855gy1ghg94y3jjjg306t0c4npd.gif)

- 默认排序，按销量排序，价格升序、降序排序：

![IMG_0917.GIF](http://ww1.sinaimg.cn/large/006Ri855gy1ghg98yop1eg309f0grhdt.gif)

### 搜索
- 输入关键字根据商品名称进行搜索
- 这里也可以进行商品根据销量、价格的排序
- 将历史搜索存入微信缓存中。

![IMG_0918.GIF](http://ww1.sinaimg.cn/large/006Ri855gy1ghg9bize5ig306u0c54qp.gif)

### 收货地址管理
- 点击确认订单后，需要自己填写姓名、电话号码、地址等详细信息。
- 这里使用了腾讯地图API获取位置信息。
- 使用了微信缓存和云数据库进行存储地址列表，缓存有的话就可以直接用缓存的。
- 可以对地址进行编辑、删除、新增地址
- 在选择了地址之后，这里设定了配送费：如果距离超市直线距离不足一公里运费为0，超出一公里运费计为人民币2元。于是可以计算出总价格。

![IMG_0919.GIF](http://ww1.sinaimg.cn/large/006Ri855gy1ghga3teiwig307u0dykjl.gif)  
![微信图片_20200805220650.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgaek6ggoj30yi1pcajq.jpg)  
![微信图片_202008052206501.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgael323yj30yi1pc7g4.jpg)  
![ca1e4de297058867d96994cdb2512f1.jpg](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgahfc34lj30u01hc773.jpg)  

### 确认下单、订单和订单详情页
- 订单界面的商品有三种状态：已完成、派送中、缺货中，缺货中的这个状态是后台管理员发现该商品缺货修改的，此时用户的订单界面的商品状态也会随之修改，由此提醒客户重新选购商品。这是当时针对实际需求而实现的功能。
![微信图片_202008052206502.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgael8s6wj30yi1pc4b1.jpg)
![微信图片_202008052206503.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgael3zipj30yi1pcdn2.jpg)
![微信图片_20200805222017.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgasbqyhdj30yi1pck3d.jpg)
![微信图片_202008052220171.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgasb6b7kj30yi1pcgt2.jpg)

- 在管理界面。设定商品为缺货

![微信图片_20200805222516.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgaxpqslvj30yi1pc138.jpg)
![微信图片_202008052225161.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgaxq40kpj30yi1pc45o.jpg)

### 个人中心（这里我是管理员，所以有商品管理和订单管理两个按钮）
![aa8887015e8cc690fa41ccd92d47cca.jpg](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgb3gbc32j30yi1pcafb.jpg)

### 确认完成订单
- 积分商品和普通商品的区别我的设计是在数据库中用一个状态码进行标志。
- 商家确认完成订单后，后台需要做的事包括：

　　1.增加用户积分，若购买的商品中包括积分商品则减去相应积分  
　　2.减少商品数量，增加相应商品销量  
　　3.订单状态修改为已完成  
　　4.将用户订单信息存入商家订单表中，这样用户可以操作自己的订单比如删除等，商家需要自己有一份订单信息。

 ![c9fa69b2b63283dc919572aaec9961c.jpg](http://ww1.sinaimg.cn/large/006Ri855gy1ghgcgidpguj30yi1pcqbt.jpg)

## 小程序码（小程序未发布，只是体验版，申请成为体验成员我通过即可）
![ac9da624cbba8d37fa38b993bd1db00.png](http://ww1.sinaimg.cn/mw690/006Ri855gy1ghgc7cpvzkj305l05it94.jpg)

## 总结
　　这是一个独立完成的比较完整的项目，期间遇到了许多问题，比如数据库的设计、函数节流、组件开发的事件触发和组件间通信、数据双向绑定、promise风格、es6的新语法等等。后来在学习Vue的时候感觉这两者相似之处有很多，入门Vue感觉也快了许多。与之前使用Layui框架结合SpringBoot写的项目相比，感觉模块化、组件化开发、数据的双向绑定，尤其MVVM模型的优越性和便利、清晰的这些优势，是很明显的。总而言之，知识无止境，技术层出不穷，知其然，也要知其所以然。


