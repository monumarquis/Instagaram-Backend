const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    imageURL: { type: String },
    username: { type: String },
    boi: { type: String },
    profession: { type: String }
  },
  { versionKey: false, timestamps: true }
);

const UserProfileModel = new mongoose.model("userProfile", UserProfileSchema);

module.exports = UserProfileModel;
