const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const Email = require('./email');

router.get('/',(req, res,next)=>{
    Email.find()
    .exec()
    .then(result=>{
        rs = result.map(doc =>{
            return{
               email :doc.email
            }
            })   
        res.status(200).json(
           rs
        );
    })
    
});

router.post('/', (req, res, next)=>{
    const email = new Email({
        _id:new mongoose.Types.ObjectId(),
        email:req.body.email
    })
    email.save().then(result=>{
        console.log(result)
    }).catch(err => {console.log(err)
        res.status(500).json({
            message:"Handling product",
            createdProduct :product
        });
    });
})

module.exports = router