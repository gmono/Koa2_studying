const Koa=require("koa")
const app=new Koa()
Date.prototype.format=function(){
    const d=this
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`

}

app.use(async (ctx,next)=>{
    const start=new Date()
    const now=new Date();
    let t=await next();
    console.log(`from ${start.format()} to ${now.format()} for ${now-start}ms`);
    return t; 
})
const bluebird=require("bluebird");
let fs=require('fs')
fs=bluebird.promisifyAll(fs);
app.use(async (ctx,next)=>{
    ctx.body=ctx.request.url;
    console.log(ctx.url);
    return await next();
})
const Router=require("koa-router");
let home=new Router();
home.get('/',async (ctx)=>{
    ctx.body=await fs.readFileAsync('index.html');
    ctx.response.set("Content-Type","text/html")
})
const bodyparser=require('koa-bodyparser')
app.use(bodyparser())
home.post('submit',async (ctx)=>{
    console.log(ctx.request.body)
})
let page=new Router();
page.get('/404',async (ctx)=>{
    ctx.body="<h1>404未找到</h1>";
})
page.get('/test',async (ctx)=>{
    ctx.body=ctx.query['test']
})

let router=new Router();
router.use('/',home.routes(),home.allowedMethods())
router.use('/page',page.routes(),page.allowedMethods())
//文件上传
const multer=require("koa-multer")
let upload=multer({
    dest:'./upload'
})
router.post('/upload',upload.single('f1'),async (ctx)=>{
    const {originalname,path,mimetype}=ctx.req.file;
    console.log(originalname,path,mimetype);
    // ctx.body="文件上传成功！";
    ctx.body+=`<script>setTimeout(()=>{window.history.back();},2000)</script>`;
})

app.use(router.routes()).use(router.allowedMethods())

const mount=require("koa-mount")
//static为一个简单的中间层，可以根据传入的url返回对应路径的文件内容
//mount为一个根据定义进行url重定向的中间件
//其可以作为static的外层 提供url重定向功能
//也可以作为Applilcation的上层
let sstatic=require('koa-static')
const path=require('path')
app.use(mount('/static/',sstatic(
    path.join(__dirname,'./')
)));

// import session from "koa2-cookie-session"
// app.use(session())
// app.use(mount('/session',(ctx)=>{
//     ctx.session.user={hello,world};
//     ctx.body=ctx.session.user;
// }))
const session =require("koa-session2")
app.use(session())
app.use(mount('/session',(ctx)=>{
    ctx.session.test++;
    ctx.body=ctx.session.test;
}))
//此处引用KeyGrip提供cookie的数字签名功能
const KeyGrip=require('keygrip')
app.keys=new KeyGrip(['hello','dadfasdf'],'sha256')
app.use(mount('/key',(ctx)=>{
    //此处对cookie添加属性 signed表示需要数字签名 expires提供一个时间戳
    ctx.cookies.set("test","value",{signed:true,expires:new Date()})
}))


app.listen(3000)

