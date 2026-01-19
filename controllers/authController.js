const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/authModel");


///////////////////////////////////
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// ========== GET LOGIN ==========
exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Todo App",
    currentPage: "login",
    errors: [],
    isLoggedIn: false,
    oldInput: { email: "", password: "" },
    userId: null, // Add userId to avoid undefined error in EJS
    user: {},
  });
};

// ========== GET SIGNUP ==========
exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Todo App",
    currentPage: "signup",
    errors: [],
    isLoggedIn: false,
    oldInput: { name: "", email: "", password: "", confirmPassword: "" },
    user: {},
    userId: null, // Add userId to avoid undefined error in EJS
  });
};

// ========== POST LOGIN ==========
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Fetch user from DB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["User does not exist"],
        oldInput: { email, password },
        userId: null, // Add userId to avoid undefined error in EJS
        user: {},
      });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: ["Invalid password"],
        oldInput: { email, password },
        userId: null, // Add userId to avoid undefined error in EJS
        user: {},
      });
    }

    // ✅ Session set (example)
    req.session.isLoggedIn = true;
    // Store only necessary data to avoid serialization issues
    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    return req.session.save((err) => {
      if (err) {
        console.log("❌ Session save error:", err);
      }
      console.log("login succesfull")
      res.redirect("/todos"); // or /notes or /jobs
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};

// ========== POST SIGNUP ==========
exports.postSignup = [
  check("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain at least one number")
    .matches(/[!@&]/)
    .withMessage("Password should contain at least one special character (! @ &)")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: errors.array().map((err) => err.msg),
          oldInput: { name, email, password, confirmPassword: "" },
          userId: null, // Add userId to avoid undefined error in EJS
          user: {},
        });
      }

      // ✅ Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          isLoggedIn: false,
          errors: ["Email already exists"],
          oldInput: { name, email, password, confirmPassword: "" },
          userId: null, // Add userId to avoid undefined error in EJS
          user: {},
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      return res.redirect("/auth/login");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server error");
    }
  },
];

//////////////////////////////////////////////////
////////////Forget///////////////////////////////
//////////////////////////////////////////////////

exports.getForgotPassword = (req, res) => {
  res.render("auth/forgot-password", {
    pageTitle: "Forgot Password",
    currentPage: "forgot-password",
    errors: [],
    oldInput: { email: "" },
    userId: null, // Add userId to avoid undefined error in EJS
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your gmail
    pass: process.env.EMAIL_PASS,   // app password
  },
});

exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).render("auth/forgot-password", {
        pageTitle: "Forgot Password",
        currentPage: "forgot-password",
        errors: ["Email not found"],
        oldInput: { email },
      });
    }

    // ✅ create token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    // ✅ send email
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset - Todo App",
      html: `
        <h2>Password Reset</h2>
        <p>Click this link to reset password:</p>
        <a href="http://localhost:3000/auth/reset/${token}">
          Reset Password
        </a>
      `,
    });

    return res.redirect("/auth/login");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};


exports.getResetPassword = async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res.redirect("/auth/forgot-password");
  }

  res.render("auth/reset-password", {
    pageTitle: "Reset Password",
    currentPage: "reset-password",
    userId: user._id.toString(),
    token: token,
    errors: [],
  });
};


exports.postResetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/reset-password", {
        pageTitle: "Reset Password",
        currentPage: "reset-password",
        userId: req.body.userId,
        token: req.body.token,
        errors: errors.array().map((err) => err.msg),
      });
    }

    const { password, userId, token } = req.body;



    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect("/auth/forgot-password");
    }

    const hashed = await bcrypt.hash(password, 12);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    return res.redirect("/auth/login");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};

//logout
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  })
}
