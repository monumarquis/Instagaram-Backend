require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const express = require("express");
const app = express.Router();
const PostModel = require("./post.model");
const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
  upload_preset: "Instagaram_Media",
};

const uploadImage = (image) => {
  //imgage = > base64
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, opts, (error, result) => {
      if (result && result.secure_url) {
        console.log(result.secure_url);
        return resolve(result.secure_url);
      }
      console.log(error.message);
      return reject({ message: error.message });
    });
  });
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/", async (req, res) => {
  let post = await PostModel.find()
  res.send({randomPost:post});
});

app.get("/userPost", async (req, res) => {
  const {userId} = req.body
  console.log(userId);
  if(!userId) return res.status(404).send({ message: "Request Not Found" });
  let post = await PostModel.find({user:userId})
  res.send({post});
});


app.post("/", async (req, res) => {
  console.log(req.body);
  try {
    const { imageUrl, desc = "", userId, likes } = req.body;
    if (!imageUrl || !userId)
      return res.status(404).send({ message: "Please Select Image" });
    uploadImage(imageUrl)
      .then(async (url) => {
        let post = await PostModel({ user: userId, imageUrl: url, description: desc, likes })
        post.save()
        return res.status(201).send({ message: "Post Uploaded" });
      })
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

app.patch("/", async (req, res) => {
  const { likes, postId, userId } = req.body;
  if (!likes) return res.status(404).res.send({ message: "Body is empty" });
  try {
    let likesUpdate = await PostModel.findOneAndUpdate(
      { post: postId, user: userId },
      { likes },
      { new: true }
    );
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
module.exports = app;
