const koa=require("koa")
const app=new koa()
Date.prototype.format=function(){
    const d=this
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`

}
app.use((ctx,next)=>{
    const start=new Date()
    return next().then(()=>{
        const now=new Date()
        console.log(`from ${start.format()} to ${now.format()} for ${now-start}ms`)

    })

})
const fs=require("fs")
app.use((ctx)=>{
    ctx.body=fs.readFileSync(`.${ctx.originalUrl}`).toString()
})
app.listen(3000)