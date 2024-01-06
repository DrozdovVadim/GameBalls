const {Router} = require('express');
const User= require('../models/User');

const router= Router();

router.get('/get', async (req, res) => {
    try {
      const userWithMaxScore = await User.findOne({}, 'name score').sort({ score: -1 });
      res.json(userWithMaxScore);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
module.exports =router;