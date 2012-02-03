var db = require('./connection');

module.exports = db.model('Invoice', new db.Schema({
  number: {type: Number, unique: true},
  lastName: String,
  firstName: String,
  amount: Number,
  tax: Number,
  custno: Number
}));