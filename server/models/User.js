const {Schema, model, Types} = require('mongoose');

const schema= new Schema({
    name: {type: String},
    score: {type: Number} 
})
module.exports= model('User', schema);