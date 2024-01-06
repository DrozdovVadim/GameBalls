const {Router} = require('express');
const User= require('../models/User');

const router= Router();

router.post('/post', async (req, res) =>
{
    try{
        const {name, score} =req.body;
        const user= new User ({
            name, score
        }
        );

        await user.save();
        res.status(201).json({message: "nice"});
    } catch(err) {
        console.log(err);
    }
})

module.exports =router;