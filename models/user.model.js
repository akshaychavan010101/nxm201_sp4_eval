const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function () {
  try {
    const hashed = bcrypt.hashSync(this.password, 5);
    this.password = hashed;
  } catch (error) {
    console.log(error);
  }
});

const UserModel = mongoose.model("user", userSchema);

module.exports = {UserModel};
