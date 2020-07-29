export const request = (params)=>{
    return new Promise((resolve,rejecj)=>{
        var reqTask = wx.request({
            ...params,
            success:(result)=>{
                resolve(result);
            },  
            fail:(err)=>{
                rejecj(err);
            }
        });
    })
}