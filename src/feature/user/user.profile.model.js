const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    imageURL: { type: String },
    username: { type: String },
    boi: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const UserModel = new mongoose.model("profile", UserSchema);

module.exports = UserModel;
