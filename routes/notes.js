const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');


router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
        console.log("notes fetched");
    } catch (error) {
        console.error(error.message);
        res.status(500).json("internal server error");
    }
})

router.post('/addnote', fetchuser, [
    body('title', 'tile must be at least 1 character').isLength({ min: 1 }),
    body('description', 'description must be at least 4 characters').isLength({ min: 4 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let { title, description, tag } = req.body;
        let note = new Notes({
            title, description, tag, user: req.user.id
        });
        let savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("internal server error");
    }
})

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {

        const note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).json("note not found");
        }
        if (req.user.id !== note.user.toString()) {
            return res.status(401).json("not allowed");
        }

        let { title, description, tag } = req.body;
        let newnote = {};
        if (title) { newnote.title = title };
        if (description) { newnote.description = description };
        if (tag) { newnote.tag = tag };

        let updatednote = await Notes.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true });
        res.json(updatednote);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("internal server error");
    }
})

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        const note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).json("note not found");
        }
        if (req.user.id !== note.user.toString()) {
            return res.status(401).json("not allowed");
        }

        let deletedNote = await Notes.findByIdAndDelete(req.params.id);
        res.json("note deleted");
    } catch (error) {
        console.error(error.message);
        res.status(500).json("internal server error");
    }
})

module.exports = router;