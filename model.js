const mongoose = require('mongoose');





const userSchema = new mongoose.Schema({
  userId: {
    type: String,
   
  },
  movieId: {
    type: Number,
  
  },
    
  name: {
    type: String,
   
  },
  
    
  lastname: {
    type: String,
   
  },
  emailId: {
    type: String,
   
  },
  password: {
    type: String,
  
  },
  vote: {
    type: String,
    enum: ["like", "dislike"],
   
  },
});
const userDataSchema = new mongoose.Schema({
  
    
  name: {
    type: String,
   
  },
  
    
  lastname: {
    type: String,
   
  },
  emailId: {
    type: String,
   
  },
  password: {
    type: String,
  
  },

});

const voteSchema = new mongoose.Schema({
  movieId: {
    type: Number,
    required: true,
    unique: true,
  },
  like: {
    type: Number,
    default: 0,
  },
  dislike: {
    type: Number,
    default: 0,
  },
});

const UserModel = mongoose.model("User", userSchema);
const VoteModel = mongoose.model("Vote", voteSchema);
const UserDataModel = mongoose.model("Cred",userDataSchema);

module.exports = {
  UserModel,
  VoteModel,
  UserDataModel
};