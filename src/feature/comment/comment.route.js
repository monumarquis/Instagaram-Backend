const express = require("express");
const app = express.Router();
const CommentModel = require("./comment.model");

// comment post routes for individual post
app.post("/", async (req, res) => {
  const { userId, postId, comment_desc } = req.body;
  if (!userId || !postId || !comment_desc) {
    return res.status(404).send({ message: "Request Not Found" });
  }
  try {
    let comment = await CommentModel({
      user: userId,
      post: postId,
      comment: comment_desc,
    });
    comment.save();
    return res.status(201).send({ cart, message: "Comment Added" });
  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
});

app.get("/", async (req, res) => {
  const { postId } = req.body;
  if (!userId || !postId) {
    return res.status(404).send({ message: "Request Not Found" });
  }
  try {
    const comment = await CommentModel.find({ post:postId }).populate("user")
    return res.status(200).send(comment);
  } catch (err) {
    return res.status(404).send({ message: err.message });
  }
});
module.exports = app;
