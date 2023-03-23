const express = require("express");
const app=express()
const axios=require("axios")
const { MongoClient } = require('mongodb');
app.use(express.json());
// var axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { UserModel,VoteModel, UserDataModel } = require("./model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const { default: axios } = require("axios");
require("dotenv").config();

// const {UserMNodel}=require("./model/user.model")
app.use(express.static(__dirname+'/public'));

app.use(bodyParser.urlencoded({ extended: false }))

const db = 'mongodb+srv://richagshah:sarita700@cluster0.zygzowx.mongodb.net/flex?retryWrites=true&w=majority';

// Connect to the MongoDB database
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const cors = require('cors');
app.use(cors());
mongoose.connect(db).then(()=>{
console.log("Mongodb connected")
}).catch((err)=>console.log("NO connected",err))

app.post('/movies/like', async (req, res) => {
  // console.log(userId,"userid")
  console.log('Received request to /movies/like route');
    const { movieId,userId } = req.body;
    console.log(req.body,"requestbody")
     // Check if the user has already voted for this movie
  const existingVote = await UserModel.findOne({ userId, movieId });
  console.log("existing person in Lik")
  if (existingVote) {
    // If the existing vote is "dislike", update it to "like"
    if (existingVote.vote === "dislike") {
      existingVote.vote = "like";
      await existingVote.save();
      
      // Update the vote count in VoteModel
      await VoteModel.findOneAndUpdate(
        { movieId },
        { $inc: { like: 1, dislike: -1 } },
        { upsert: true }
      );
    }
    // If the existing vote is already "like", do nothing
    console.log("like updated")
    return res.sendStatus(200);
  }
  
  // Create a new user record with the vote
  const newUser = new UserModel({
    userId,
    movieId,
    vote: "like",
  });
  
  // Update the vote count in VoteModel
  await VoteModel.findOneAndUpdate(
    { movieId },
    { $inc: { like: 1 } },
    { upsert: true }
  );
  
  // Save the new user record
  await newUser.save();
  
  console.log("Data updated in MongoDB");
  
  res.sendStatus(200);
    
  });
  
  app.post('/movies/dislike', async (req, res) => {
    const { movieId,userId } = req.body;
    await console.log(userId,"userid")
  
    const existingVote = await UserModel.findOne({ userId, movieId });
    if (existingVote) {
      console.log("extingvote updated")
      // If the existing vote is "dislike", update it to "like"
      if (existingVote.vote === "like") {
        existingVote.vote = "dislike";
        await existingVote.save();
        
        // Update the vote count in VoteModel
        await VoteModel.findOneAndUpdate(
          { movieId },
          { $inc: { like: -1, dislike: 1 } },
          { upsert: true }
        );
      }
      // If the existing vote is already "like", do nothing
      console.log("dislike updated")
      return res.sendStatus(200);
    }
    
    // Create a new user record with the vote
    const newUser = new UserModel({
      userId,
      movieId,
      vote: "dislike",
    });
    
    // Update the vote count in VoteModel
    await VoteModel.findOneAndUpdate(
      { movieId },
      { $inc: { dislike: 1 } },
      { upsert: true }
    );
    
    // Save the new user record
    await newUser.save();
    
    console.log("Data updated in MongoDB");
    
    res.sendStatus(200);

  });
  app.get("/data", async (req, res) => {
    try {
      const data = await VoteModel.find({});
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/userdata", async (req, res) => {
    try {
      const data = await UserModel.find({});
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/usercreds", async (req, res) => {
    try {
      const data = await UserDataModel.find({});
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
//signup signin
app.post("/signup", async (req, res) => {
  const { emailId,name,lastname ,password } = req.body;
console.log(req.body)
  try {
    const existingUser = await UserDataModel.findOne({ emailId });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserDataModel({
      emailId,
      name,
      lastname,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ emailId }, "secret");

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
app.post('/signin', cors(), async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const existingUser = await UserDataModel.findOne({ emailId });

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: existingUser.emailId }, 'secret');

    res.status(200).json({ token,emailId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.put('/changepassword', async (req, res) => {
  const { emailId, currentPassword, newPassword } = req.body;
console.log(emailId,"email")
  try {
    const existingUser = await UserDataModel.findOne({ emailId });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedNewPassword;
    await existingUser.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

 
app.listen(8080,function(){
    console.log("listening on port 8080")
})

