const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models/");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const WEB_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(WEB_CLIENT_ID);

class AuthController {
  static async register(req, res, next) {
    try {
      const { fullname, email, password } = req.body;
      const user = await User.create({ fullname, email, password });
      res.status(201).json({ name: user.fullname, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const idToken = req.body.id_token || req.headers["id_token"];
      if (!idToken) {
        throw { name: "BadRequest", message: "id_token is required" };
      }

      const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, sub: userid } = payload;

      let user = await User.findOne({ where: { email } });
      if (!user) {
        const placeholderPassword = userid + WEB_CLIENT_ID.slice(0, 6);
        user = await User.create({
          fullname: name || email.split("@")[0],
          email,
          password: placeholderPassword,
        });
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (error) {
      console.error("Google login error", error);
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      res.json({ user: user.toJSON() });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
