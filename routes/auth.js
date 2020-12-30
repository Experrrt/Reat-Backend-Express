const express = require ('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

const User = require('../models/user');

const {registerValidation, loginValidation} = require('../validation')

router.post('/register', async (req, res)=>{

  
    const {error} =registerValidation(req.body);
    if(error){console.log(error); return res.send({message:'WE',problem:error.details[0].message})}
    
    const exists = await User.findOne({email:req.body.email})
    if(exists) return res.send({message:'WE',problem:'inuse'})

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name:req.body.name,
        email:req.body.email,
        password: hashPassword
    })
    
    await user.save()
    .then(result =>{
        console.log(result)
        res.json({message:'registered',user:{name:result.name,email:result.email,id:result._id}})
        // res.send('registered')
    }).catch(err => {
        console.log(err)
        res.status(400)
    })
})

router.post('/login', async (req,res)=>{

    const {error} =loginValidation(req.body);
    if(error){console.log(error); return res.status(400).send(error.details[0].message);}

    const user = await User.findOne({email:req.body.email})
    if(!user) return res.status(400).send('IE')

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass)  return res.status(400).send('IP')

    res.send('succes');
})


router.delete('/', async(req,res)=>{
    await User.deleteMany({})
    .then(result =>{console.log(result)})
})

module.exports = router;