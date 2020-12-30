const express = require ('express');
const app = express();
var cors = require('cors');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const emailRoutes =require('./routes/emails');
const dotenv = require('dotenv');
const  mongoose = require('mongoose');
const bodyParser =require('body-parser');
const authRoute = require('./routes/auth');

dotenv.config();

app.use(cors({origin:true,credentials:true}))

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)
app.use('/api', emailRoutes)
app.use('/api/user', authRoute)

mongoose.connect(process.env.DB_CONNECT,{ useNewUrlParser: true, useUnifiedTopology:true },()=>console.log('Connected to mongoose'))

app.use((req, res, next) =>{
    const error = new Error('Not found');
    error.status=404;
    next(error);
})

app.use((error, req, res, next)=>{
    res.status(error.status||500);
    res.json({
        error:{
            message: error.message
        }
    });
});

module.exports =app;