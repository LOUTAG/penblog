const express = require('express');
const { notFoundError } = require('./middlewares/notFoundError');
const {errorHandler} = require('./middlewares/errorHandler');
/*** mongoose setup ***/
const mongoose = require('mongoose');
const keys = require('./config/keys');
mongoose.connect(keys.mongoURI);

//checking
mongoose.connection.on('connected', ()=>{
    console.log('Database connected');
});
mongoose.connection.on('error', ()=>{
    console.log('Database not connected');
})


const app = express();

/*** middlewares ***/
app.use(express.json());
//express.json() is an inbuilt method that recognize the icoming request object as a JSON object.

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const emailRoutes = require('./routes/emailRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const refreshTokenRoute = require('./routes/refreshTokenRoute');
userRoutes(app);
postRoutes(app);
commentRoutes(app);
emailRoutes(app);
categoryRoutes(app);
refreshTokenRoute(app);
if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'));
    //if front request, take a look inside client/build
    const path=require('path');
    app.get('*', (req, res)=>{
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
    //serve the index.html
}

//not found error
app.use(notFoundError);

//error handler
app.use(errorHandler);

/*** PORT ***/
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`app running port ${PORT}`));