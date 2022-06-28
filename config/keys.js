if(process.env.NODE._ENV==='production'){
    module.exports=require('./prod.js');
}else{
    module.exports=require('./dev.js');
}
