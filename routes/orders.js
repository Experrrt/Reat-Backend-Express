const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order.js');

router.get('/', (req, res, next)=>{
    Order.find()
    .select('_ide quantity product')
    .exec()
    .then(docs=>{
        res.status(200).json({
           count : docs.length,
           orders: docs,
    })
    });
});

router.post('/', (req, res, next)=>{

    const order= new Order({
        _id :mongoose.Types.ObjectId(),
        quantity :req.body.quantity,
        product:req.body.product
    });
    order.save().then(result =>{
        res.status(200).json({
            message: "Order created sucesfully",
            result})
    
    });

});

router.get('/:orderId', (req, res, next)=>{

    res.status(201).json({
        message:'Order details',
        orderId:req.params.orderId
    });
});

module.exports = router