exports.errorHandler =(error, req, res, next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).send({
        message: error?.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack
    })
}