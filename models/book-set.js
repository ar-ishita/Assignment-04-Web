var mongoose = require("mongoose");
var Schema = mongoose.Schema;
BookSchema = new Schema({
  ISBN: String,
  img: String,
  title: String,
  author: String,
  inventory: Number,
  category: String,
});
module.exports = mongoose.model("Bookset", BookSchema);
