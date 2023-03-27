const jwt = require("jsonwebtoken");
require("dotenv").config();
const redis = require("redis");
const client = redis.createClient();
client.connect();
client.on("connect", () => {
  console.log("Redis is connected");
});

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const bltoken = await client.get(`${token}`);
    if (bltoken) {
      return res.send({ msg: "Please login again" });
    }
    if (!token) {
      return res.send({ msg: "Please Login first" });
    }
    await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.send({ msg: "Please login again" });
      } else {
        req.body.user = decoded.user;
        next();
      }
    });
  } catch (error) {
    res.send({ msg: "Error", error: error.message });
  }
};

module.exports = { authentication };
