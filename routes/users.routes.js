const express = require("express");
const fetch = require("node-fetch");
const { UserModel } = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authentication } = require("../middlewares/authentication");
require("dotenv").config();
const redis = require("redis");
const { cityModel } = require("../models/cities.model");
const client = redis.createClient();
client.connect();
client.on("connect", () => {
  console.log("Redis is connected");
});

const UserRouter = express.Router();

UserRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.send({ msg: "User already exists, Please login" });
    }

    const new_user = new UserModel({ name, email, password });
    await new_user.save();
    res.send({ msg: "User registered successfully" });
  } catch (error) {
    res.send({ msg: "Error", error: error.message });
  }
});

UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.send({ msg: "User does not exists, Please refgister first" });
    } else {
      await bcrypt.compare(password, user.password, async (err, result) => {
        if (err) {
          return res.send({ msg: "Wrong Password" });
        } else {
          const token = await jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: "1hr",
          });
          res.send({ msg: "Login successful", token });
        }
      });
    }
  } catch (error) {
    res.send({ msg: "Error", error: error.message });
  }
});

UserRouter.get("/logout", authentication, async (req, res) => {
  try {
    const token = req.headers.authorization;
    await client.set(`${token}`, `${token}`);
    res.send({ msg: "Logout successfull" });
  } catch (error) {
    res.send({ msg: "Error", error: error.message });
  }
});

UserRouter.get("/city-whether", authentication, async (req, res) => {
  try {
    const { city } = req.query;
    const citydata = await client.get(`${city}`);

    if (citydata !== null) {
      console.log(citydata);
      res.send(citydata);
    } else {
      let data = await fetch(
        `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=fc854924ecbe491bc9ceb8a9b5c13678`
      )
        .then((res) => res.json())
        .then((res) => {
          return res;
        });
      // console.log(data);
      data = JSON.stringify(data);
      client.set(`${city}`, `${data}`, {
        EX: 1800,
      });
      const userId = req.body.user._id;
      const pcity = new cityModel({ prefferedCity: city, userId });
      console.log(pcity);
      await pcity.save();
      res.send(data);
    }
  } catch (error) {
    res.send({ msg: "Error", error: error.message });
  }
});

UserRouter.get("/history", authentication, async (req, res) => {
  try {
    const userId = req.body.user._id;
    const history = await cityModel.find({ userId });
    if (history) {
      res.send(history);
    } else {
      res.send({ msg: "No city prefered" });
    }
  } catch (error) {
    res.send({ msg: "error", error: error.message });
  }
});

module.exports = { UserRouter };
