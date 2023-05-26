let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    content: { type: String, required: true },
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    articleSlug: { type: String, required: true },
    likes: Number,
    dislikes: Number,
  },
  { timestamps: true }
);

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
