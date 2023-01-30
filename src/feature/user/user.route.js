const UserModel = require("./user.model");
const UserProfileModel = require("./user.profile.model");
const express = require("express");
const app = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN;

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

  console.log(req.body);
  const hash = bcrypt.hashSync(password, 10);
  const user = await UserModel({ username, fullname, email, password: hash });
  user.save();
  // along with userProfile
  const userProfile = await UserProfileModel({user:user.id,username:user.username})
  userProfile.save()
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
  if(!User){
    User = await UserModel.findOne({ username:email });
  }
  if (!User) return res.status(403).send({ message: "Invalid Details! User Not Found " });
  //    console.log(User)
  try {
    const match = bcrypt.compareSync(password, User.password);
    const userProfile = await UserProfileModel.findOne({user:User.id})
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
        .send({ message: "Login Successfull", token, refresh_token, userId: userProfile.id });
    } else {
      return res.status(401).send({ message: "Password is Incorrect" });
    }
  } catch {
    return res.status(401).send({ message: "Invalid Credentials" });
  }
});

// Bio details --> DP , Followers ,Following ,Boi , Feed
app.post('/getProfile', async (req, res) => {

})

app.get('/getProfile', async (req, res) => {

})

app.patch('/getProfile', async (req, res) => {

})

module.exports = app;
