const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = "goodeno@ughk$y";
const fetchuser = require('../middleware/fetchuser');

router.post('/createuser', [
  body('name', 'name must be at least 2 characters').isLength({ min: 2 }),
  body('email', 'enter valid email').isEmail(),
  body('password', 'password must be at least 4 characters').isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json("email already exists");
    }

    let salt = await bcrypt.genSaltSync(10);
    let pass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: pass
    })


    let data = {
      user: {
        id: user.id
      }
    }
    let token = jwt.sign(data, secretKey);
    res.json({ token });
    console.log("sent to database");

  } catch (error) {
    console.error(error.message);
    res.status(500).json("internal server error");
  }
})

router.post('/login', [
  body('email', 'enter valid email').isEmail(),
  body('password', 'password must be at least 4 characters').isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json("please enter correct credentials");
    }

    let comp = await bcrypt.compare(password, user.password);
    if (!comp) {
      return res.status(400).json("please enter correct2 credentials");
    }

    let data = {
      user: {
        id: user.id
      }
    }
    let token = jwt.sign(data, secretKey);
    res.json({ token });


  } catch (error) {
    console.error(error.message);
    res.status(500).json("internal server error");
  }
})

router.post('/getuser', fetchuser, async (req, res) => {
  try {
    let userid = req.user.id;
    let user = await User.findById(userid).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("internal server error");
  }
})

module.exports = router;