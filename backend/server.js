const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const User = require("../models/users");
const bcrypt = require("bcryptjs");

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'admin';

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function connectToDatabase() {
  try {
    await mongoose.connect(`${url}/${dbName}`, mongooseOptions);
    console.log('Connected successfully to MongoDB server');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

app.use(cors({
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
}));

app.use(express.json());

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { username, password: plainTextPassword, email , wallet } = req.body;
  const password = await bcrypt.hash(plainTextPassword, 10);
  
  if(!username || typeof username !== 'string'){
    return res.json({
      status: 'error',
      error: 'Invalid username'
    });
  } 
  if(!plainTextPassword || typeof plainTextPassword !== 'string'){
    return res.json({
      status: 'error',
      error: 'Invalid password'
    })
  }
  if(plainTextPassword.length < 5){
    return res.json({
      status: 'error',
      error: 'Password too small. Should be at least 6 characters.'
    })
  }

  

  try {
    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({
      $or: [{ username }, { email } , { wallet }],
    });

    if (existingUser) {
      return res.json({
        status: 'error',
        error: "Username or email or wallet already exists",
      });
    }

    // Create a new user since the username and email are unique
    const newUser = await User.create({
      username,
      email,
      password,
      wallet
    });

    console.log("User created successfully:", newUser);
    res.status(200).json({ 
      message: "User registered successfully",
      status: 'ok'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: "An error occurred while registering user"
    });
  } 
});

async function startServer() {
  await connectToDatabase();
  app.listen(2000, () => {
    console.log("Server is live on port 2000...");
  });
}

startServer();
