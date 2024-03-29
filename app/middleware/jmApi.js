
/**
 * api请求拦截中间件
 */
 module.exports = options => {
    // const skipExt = [ '.png', '.jpeg', '.jpg', '.ico', '.gif' ];
    return async function(ctx, next) {
        // 如果api请求，则走特殊逻辑
        //console.log(ctx.isApi);
        if (ctx.isApi) {
            await ctx.requestApi(next); // 调用framework中的api处理函数
            return;
        }
        await next();
    };
};
