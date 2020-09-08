const express = require ('express')
const app = express();

const productRoutes = require('./products');
const orderRoutes = require('./orders');
const  mongoose = require('mongoose');
const bodyParser =require('body-parser')

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/orders', orderRoutes)
app.use('/products', productRoutes)

mongoose.connect("mongodb+srv://front:kubo2013@cluster0.blcya.mongodb.net/<dbname>?retryWrites=true&w=majority"  )

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