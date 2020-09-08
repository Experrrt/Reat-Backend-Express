const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('./product');

router.get('/', (req, res, next) =>{
    Product.find()
    .select('name price _id')
    .exec()
    .then(result =>{
        console.log(result)
        rs = result.map(doc =>{
            return{
                name :doc.name,
                price :doc.price,
                _id:doc._id,
            }
            })   
        res.status(200).json(
           rs
        );
        

    });

    

});

router.post('/', (req, res, next) =>{
    const product = new Product({
        _id:new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(result =>{
        console.log(result);
        
    }).catch(err => {console.log(err)
        res.status(500).json({
            message:"Handling product",
            createdProduct :product
        });
    });

});

router.get('/:productId', (req, res, next) =>{
    const id = req.params.productId;
   Product.findById(id)
   .exec()
   .then(result=>{
       console.log(result)
       res.status(200).json({
           name: result.name,
           price: result.price,
           id:result._id
       });
   })
   .catch(err => {
       console.log(err);
        res.status(500).json({error:err});

    });

});

router.patch('/:productId', (req, res, next) =>{
   
        res.status(200).json({
            message: "Updated",
            
        });
    });

router.delete('/', (req, res, next) =>{
    Product.deleteMany({"price":12.99})
    .exec()
    .then(result =>{
        res.status(200).json(result);
    });
});


module.exports = router;