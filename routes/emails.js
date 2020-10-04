const express = require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const Email = require('../models/email');
const nodemailer = require('nodemailer');
const email = require('../models/email');
const dotenv = require('dotenv');

var users=[]

dotenv.config();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'marcekland@gmail.com',
        pass: process.env.PAS_EMAIL
    }
});

function sendConfirm(user){
    transporter.sendMail({from :'marcekland@gmail.com',to: user,subject:'THX',text:'Bla bla bla'}, function(err, info){
        if(err){
            // console.log(err+'');
        }
        else{
            console.log('Email set: ',info.response);
        }
    })
}

function send(){
    console.log(users.length)
    for (i =0; i<users.length;i++){
    transporter.sendMail({from :'marcekland@gmail.com',to: users[i],subject:'Node js test email',text:'Bla bla bla'}, function(err, info){
    if(err){
        console.log(err);
    }
    else{
        console.log('Email set: ',info.response);
    }
})
}
}

router.get('/',(req, res,next)=>{
    users=[]
    Email.find()
    .exec()
    .then(result=>{
        
        rs = result.map(doc =>{
            users.push(doc.email)
            console.log(users)
            return{
               email :doc.email
            }  
        })   
        // send();
        res.status(200).json(
           rs
        );
    })
    
});

router.post('/', (req, res, next)=>{    
    users =[]
    Email.find()
    .exec()
    .then(result=>{
        if(result.length !=0){
        result.map(doc=>{
            users.push(doc.email)
        })
            if(users.includes( req.body.email)){
                res.status(200).json({message:'inuse'})
            }else{
                        const email = new Email({
                _id:new mongoose.Types.ObjectId(),
                email:req.body.email
            })
            email.save()   
            .then(resulttt =>{
                sendConfirm(req.body.email)
                res.status(200).json({message:'registered'})
                }).catch(err => {console.log(err)
                    res.status(500).json({
                    message:"Email is not valid"
            });
            })
            // res.status(200).json({message:'pepega'})
            }
        
    }else{
        const email = new Email({
            _id:new mongoose.Types.ObjectId(),
            email:req.body.email
            
        })
        email.save()
        .then(resultt =>{
            sendConfirm(req.body.email)
            res.status(200).json({message:'registered'})
            }).catch(err => {console.log(err)
                res.status(500).json({
                message:"Email is not valid"
        });
        })
        // result = {message :'pepegaaaa'}
    }
            // res.status(200).json(
            //     result 
            // )
        }    //     
// }else{
             
    // const email = new Email({
    //     _id:new mongoose.Types.ObjectId(),
    //     email:req.body.email
    // })
    // email.save()
    // .then(result=>{
    //     // result.send('daco')
    //     // sendConfirm(req.body.email)
    //     res.status(200).json(result)
    //     console.log(result)
    // }).catch(err => {console.log(err)
    //     res.status(500).json({
    //         message:"Email is not valid"
    //     });
    // });
    //     }
    
    )})
    // })

router.delete('/', (req, res, next)=>{
    Email.deleteMany({})
    .exec()
    .then(result =>{
        res.status(200).json(result);
    });
})

module.exports = router