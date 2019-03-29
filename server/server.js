const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Comment out when launching on server
app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/twiddurdb1', {
  useNewUrlParser: true
});

// Configure multer so that it will upload to '/public/postImages'
const multer = require('multer')
const upload = multer({
  dest: './public/postImages/',
  limits: {
    fileSize: 10000000
  }
});

// Create a schema for posts
const postSchema = new mongoose.Schema({
  username: String,
  date: Number,
  text: String,
  imgBool: Boolean,
  img: String,
  editBool: Boolean,
  likes: Number
});

// Create a model for posts.
const Post = mongoose.model('Post', postSchema);

// Upload a photo. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/postImages/" + req.file.filename
  });
});

// Create a new post in the database
app.post('/api/posts', async (req, res) => {
  const post = new Post({
    username: req.body.username,
    date: req.body.date,
    text: req.body.text,
    imgBool: req.body.imgBool,
    img: req.body.img,
    editBool: req.body.editBool,
    likes: req.body.likes
  });
  try {
    await post.save();
    res.send(post);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the posts.
app.get('/api/posts', async (req, res) => {
  try {
    let posts = await Post.find();
    res.send(posts);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  //let post = await Post.find();
  Post.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)}, function(err, result) {
    if (err) {
      throw err;
    }
  })
});

app.put('/api/posts/:id', async (req,res) => {
  try {
    console.log("Updating " + req.params.id);
    await Post.updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {
      text: req.body.text,
    });
    console.log("Success");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})

app.put('/api/like/:id', async (req,res) => {
  try {
    console.log("Liking " + req.params.id);
    await Post.updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {
      likes: req.body.likes,
    });
    console.log("Success");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
})

app.listen(3000, () => console.log('Server listening on port 3000!'));
