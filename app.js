
require("dotenv").config();
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const authRouter = require("./routes/authRouter");
const todoRouter = require("./routes/todoRouter");
const notesRouter=require("./routes/notesRouter");
const blogRouter = require("./routes/blogRouter");
const errorsController = require("./controllers/errors");

const app = express();

const PORT = 3000;
const DB_PATH = "mongodb+srv://bilalhyder:bilal@todo.3f7raqs.mongodb.net/todoDB";

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log("❌ Session Store Error:", error);
});

// ✅ VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ MIDDLEWARES
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "KnowledgeGate AI with Complete Coding",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);


// ✅ session to all ejs
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  next();
});

// ✅ ROUTES
app.use("/auth", authRouter);

// 🔥 IMPORTANT: mount todoRouter on /todos
app.use("/todos", todoRouter);
app.use("/todos", notesRouter);
app.use(blogRouter);
// ✅ Redirect root to /todos
app.get("/", (req, res) => {
  res.redirect("/todos");
});

// ✅ 404
app.use(errorsController.pageNotFound);

// ✅ DB + server
mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("❌ MongoDB error:", err));
