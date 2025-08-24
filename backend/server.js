const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const axios = require("axios"); // Import axios for HTTP requests

const url = "mongodb://62.60.198.61:27017";
const dbName = "admin";

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function connectToDatabase() {
  try {
    await mongoose.connect(`${url}/${dbName}`, mongooseOptions);
    console.log("Connected successfully to MongoDB server");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

app.use(
  cors({
    origin: 'http://62.60.198.61:3000',
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, password: plainTextPassword, wallet } = req.body;

  if (!username || typeof username !== "string" || !username.includes("@")) {
    return res.json({
      status: "error",
      error: "Invalid username. Must be in email format.",
    });
  }
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({
      status: "error",
      error: "Invalid password",
    });
  }
  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Password too small. Should be at least 6 characters.",
    });
  }

  try {
    // Send request to the backend at localhost:8080/accounts/api/register/
    const response = await axios.post("http://62.60.198.61:8080/accounts/api/register/", {
      username, // Email format
      password: plainTextPassword,
      wallet_address: wallet,
    });

    if (response.status === 200) {
      console.log("User registered successfully:", response.data);
      return res.status(200).json({
        message: "User registered successfully",
        status: "ok",
      });
    } else {
      return res.json({
        status: "error",
        error: "Failed to register user",
      });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.json({
      status: "error",
      error: "An error occurred while registering user",
    });
  }
});

app.post("/createNft", async (req, res) => {
  console.log("ok");
  console.log(req.body);
});

async function startServer() {
  await connectToDatabase();
  app.listen(2000, () => {
    console.log("Server is live on port 2000...");
  });
}

startServer();