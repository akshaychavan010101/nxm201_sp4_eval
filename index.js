const express = require("express");
const cors = require("cors");
require("dotenv").config();
const redis = require("redis");
const client = redis.createClient();
client.on("error", (err) => console.log(err.message));
(async () => await client.connect())();
client.on("redy", () => console.log("Redis connected"));

const { connection } = require("./config/db");
const { UserRouter } = require("./routes/users.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Welcome to the wheather app");
});

app.use(UserRouter);

app.listen(process.env.PORT, async (req, res) => {
  try {
    await connection;
    console.log("Running and connected to DB");
  } catch (error) {
    console.log(error);
  }
});
