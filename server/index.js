const express= require('express');
const mongoose = require('mongoose');
const cors= require('cors');
const PORT =  5454;
const app = express();
const post= require('./Routes/post.js');
const get = require('./Routes/get.js');
app.use(express.json({extended: true}))
app.use(cors());


app.use(post);
app.use(get);
async function start()
{
    try {
        await mongoose.connect('mongodb+srv://Vadim:admin@score.kqqio3g.mongodb.net/db?retryWrites=true&w=majority');


        app.listen(PORT, () =>
        {
            console.log(PORT);
        })
    } catch (e) {console.log("ERRROOOOOOOORRRR\n")+ console.error(e);}
}

start();
