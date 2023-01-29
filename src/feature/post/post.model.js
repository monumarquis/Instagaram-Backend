const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    imageUrl: { type: String, required: true },
    likes: { type: Number, required: true ,min:0},
    description: { type: String, }
  },
  { versionKey: false, timestamps: true }
);

const PostModel = new mongoose.model("post", PostSchema);

module.exports = PostModel;
