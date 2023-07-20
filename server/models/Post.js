const mongoose = require("mongoose");
const schema = mongoose.Schema;

const postSchema = new schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

let postModel = mongoose.model('Post', postSchema);
module.exports = postModel;
