const Note = require("../models/noteModel");

// GET /notes
exports.getNotes = async (req, res) => {
  try {
    console.log("✅ getNotes called");

  const notes = await Note.find({ userId: req.session.user._id })
  .sort({ createdAt: -1 });


    console.log("✅ Notes found:", notes.length);

    return res.render("todos/notes", {
      pageTitle: "My Notes",
      notes,
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};

exports.postNotes =(req, res) => {
  const { title, content } = req.body;
  // Save note to database
  const notes=new Note({ title, content, userId: req.session.user._id });
  notes.save().then(() => {
    console.log("✅ New Note:", req.body);
    res.redirect("/todos/notes");
  }).catch((err)=>{
    console.log(err,"error while adding note");
  })
}