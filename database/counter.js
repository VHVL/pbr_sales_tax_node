var db = require('./connection');

var CounterSchema = new db.Schema({
  _id: String,
  count: Number
});

CounterSchema.statics.increment = function (database, callback) {
  return this.collection.findAndModify({ _id: database }, [],
    { $inc: { count: 1 } }, {'new': true, upsert: true}, function (err, result) {
      if (err)
        callback(err);
      else
        callback(null, result.value.count);
    });
};

var Counter = db.model('Counter', CounterSchema);

module.exports = Counter;
