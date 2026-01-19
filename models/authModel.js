const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'First name is required']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  resetToken: String,
resetTokenExpiration: Date,

  
  
});

module.exports = mongoose.model('User', userSchema);
