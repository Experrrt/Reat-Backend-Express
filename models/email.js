const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    email: {type: String, required:true}
});

module.exports = mongoose.model('Email',productSchema)