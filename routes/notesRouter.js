const express = require("express");
const notesController = require("../controllers/notesController");
const isAuth = require("../middleware/is-auth");

const notesRouter = express.Router();


notesRouter.post("/notes", isAuth, notesController.postNotes);

notesRouter.get("/notes", isAuth, notesController.getNotes);

module.exports=notesRouter