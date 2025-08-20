const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require('../models/');

async function register(req, res, next) {
  try {
    const { fullname, email, password } = req.body;
    
    const user = await User.create({ 
      fullname,
      email, 
      password 
    });
    
    res.status(201).json({
      name: user.fullname,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw { name: "BadRequest", message: "Email is required" };
    }
    if (!password) {
      throw { name: "BadRequest", message: "Password is required" };
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw { name: "Unauthorized", message: "Invalid email/password" };
    }

    const isValidPassword = comparePassword(password, user.password);

    if (!isValidPassword) {
      throw { name: "Unauthorized", message: "Invalid email/password" };
    }

    const access_token = signToken({ id: user.id });

    res.status(200).json({ access_token: access_token });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
