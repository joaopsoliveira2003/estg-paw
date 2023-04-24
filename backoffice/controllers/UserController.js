const crypto = require('crypto');

const User = require("../models/User");

let userController = {};

userController.countUsers = (criteria = {}) => {
  return User.countDocuments(criteria).exec();
};

userController.getUsers = (criteria = {}) => {
  return User.find(criteria);
};

userController.getUser = (criteria = {}) => {
  return User.findOne(criteria).exec();
};

userController.createUser = (user) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
  user.salt = salt;
  user.password = hash;
  let newUser = new User(user);
  return newUser.save();
};

userController.updateUser = (criteria, user) => {
  if (user.password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
    user.salt = salt;
    user.password = hash;
  }
  return User.findOneAndUpdate(criteria, user).exec();
}

userController.checkPassword = async (user_id, salt, password) => {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  const user = await userController.getUser({ _id: user_id })
  if (!user) {
    return false;
  }
  return hash === user.password;
};

module.exports = userController;
