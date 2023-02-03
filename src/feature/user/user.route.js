require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const UserModel = require("./user.model");
const UserProfileModel = require("./user.profile.model");
const express = require("express");
const app = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN;
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


// All Users
app.get("/", async (req, res) => {
  const user = await UserModel.find({});
  return res.status(201).send(user);
});

// signup route
app.post("/signup", async (req, res) => {
  const { username, email, password, fullname } = req.body;
  if (!username || !email || !password || !fullname)
    return res.status(403).send({ message: "Please Enter All Details" });

  const exsistUsername = await UserModel.findOne({ username });
  if (exsistUsername)
    return res
      .status(404)
      .send({ message: "Username Already exsist" });
  const exsistEmail = await UserModel.findOne({ email });
  if (exsistEmail)
    return res
      .status(404)
      .send({ message: "Email Already exsist" });

  // console.log(req.body);
  const hash = bcrypt.hashSync(password, 10);
  const user = await UserModel({ username, fullname, email, password: hash });
  user.save();
  // along with userProfile
  const userProfile = await UserProfileModel({ user: user.id, realname: user.fullname, username: user.username, boi: "", imageUrl: "", profession: "" })
  userProfile.save()
  console.log(userProfile)
  return res
    .status(201)
    .send({ message: "You have Signed up Successfully" });
});

// Log in Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password) {
    return res.status(403).send({ message: "Please Enter All Credentials" });
  }
  let User = await UserModel.findOne({ email });
  if (!User) {
    User = await UserModel.findOne({ username: email });
  }
  if (!User) return res.status(403).send({ message: "Invalid Details! User Not Found " });
  //    console.log(User)
  try {
    const match = bcrypt.compareSync(password, User.password);
    const userProfile = await UserProfileModel.findOne({ user: User.id })
    // console.log(match);
    if (match) {
      //login
      const token = jwt.sign(
        {
          _id: User.id,
          username: User.username,
          email: User.email,
          password: User.password,
        },
        SECRET_TOKEN,
        {
          expiresIn: "7 days",
        }
      );
      const refresh_token = jwt.sign(
        {
          _id: User.id,
          username: User.username,
          email: User.email,
          password: User.password,
        },
        SECRET_REFRESH_TOKEN,
        {
          expiresIn: "28 days",
        }
      );
      return res
        .status(200)
        .send({ message: "Login Successfull", token, refresh_token, userId: userProfile.id, username: userProfile.username });
    } else {
      return res.status(401).send({ message: "Password is Incorrect" });
    }
  } catch {
    return res.status(401).send({ message: "Invalid Credentials" });
  }
});

// get user details individully
app.get('/getProfile', async (req, res) => {
  const { username } = req.headers
  console.log(username);
  if (!username) return res.status(500).send({ message: "Request not found" })
  try {
    let userProfile = await UserProfileModel.findOne({ username }).populate(["followers","following"])
    return res.status(200).send(userProfile)
  }
  catch (err) {
    return res.status(401).send({ message: "Request Not Found" });
  }
})
// Bio details --> DP , Followers ,Following ,Boi , Feed

app.patch('/getProfile', async (req, res) => {
  const { userid, imageUrl = "", boi = "", profession = "" } = req.body
  console.log(userid);
  if (!userid || !imageUrl || !boi || !profession) return res.status(500).send({ message: "Request not found" })
  try {
    uploadImage(imageUrl)
      .then(async (url) => {
        let userProfile = await UserProfileModel.findOneAndUpdate({ _id: userid }, { imageUrl, boi, profession }, { new: true })
        return res.status(200).send({ message: "Profile Updated" })
      })
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });

  }
  catch (err) {
    return res.status(401).send({ message: "Request Not Found" });
  }
})

//follow a user

app.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await UserProfileModel.findById(req.params.id);
      const currentUser = await UserProfileModel.findById(req.body.userId);
      console.log(currentUser,user);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        return res.status(200).send("user has been followed");
      } else {
        return res.status(403).send("you allready follow this user");
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  } else {
    return res.status(403).send("you cant follow yourself");
  }
});

//unfollow a user

app.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await UserProfileModel.findById(req.params.id);
      const currentUser = await UserProfileModel.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        return res.status(200).send("user has been unfollowed");
      } else {
        return res.status(403).send("you dont follow this user");
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  } else {
    return res.status(403).send("you cant unfollow yourself");
  }
});
module.exports = app;
