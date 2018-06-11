var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
});

ProductSchema.plugin(mongoosastic, {
  hosts: [
    'https://mcgam3bp5v:ns3t8tv4sm@first-cluster-9032259311.us-east-1.bonsaisearch.net'
  ]
});

module.exports = mongoose.model('Product', ProductSchema);
