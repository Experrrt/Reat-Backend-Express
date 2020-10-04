const express = require ('express')
const app = express();
var cors = require('cors')
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const emailRoutes =require('./emails')
const dotenv = require('dotenv');
const  mongoose = require('mongoose');
const bodyParser =require('body-parser')

dotenv.config();

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/orders', orderRoutes)
app.use('/products', productRoutes)
app.use('/', emailRoutes)

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