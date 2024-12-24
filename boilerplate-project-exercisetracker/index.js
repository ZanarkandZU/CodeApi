const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortId = require('shortid');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

try {
  mongoose.connect('mongodb://localhost:27017/belajar');
  console.log('DataBase Connected succsess');
} catch (err) {
  return console.log(`Connect in Database Error: ${err}`);
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: shortId.generate },
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  log: [
    {
      description: { type: String },
      duration: { type: Number },
      date: { type: String },
    },
  ],
});

const User = mongoose.model('Users', userSchema);

app.post('/api/users', async (req, res) => {
  const username = req.body.username;

  if (!username) return res.send('Username is required');

  try {
    const found = await User.findOne({ username: username });
    if (found) return res.send('Username is taken');

    const newUser = new User({ username });
    const savedUser = await newUser.save();

    res.json({
      username: savedUser.username,
      _id: savedUser._id,
    });
  } catch (err) {
    res.send(`Server Error: ${err}`);
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.send('Server error');
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  let { description, duration, date } = req.body;

  !date
    ? (date = new Date().toDateString())
    : (date = new Date(date).toDateString());

  try {
    const findIdPeople = await User.findOne({ _id: id });

    if (findIdPeople) {
      findIdPeople.count++;
      findIdPeople.log.push({
        description: description,
        duration: parseInt(duration),
        date: date,
      });
      findIdPeople.save();

      res.json({
        username: findIdPeople.username,
        description: description,
        duration: parseInt(duration),
        _id: id,
        date: date,
      });
    }
  } catch (err) {
    console.error(err);
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const findIdUser = await User.findById(req.params._id);

    let resObj = findIdUser;

    if (req.query.from || req.query.to) {
      let fromDate = new Date(0);
      let toDate = new Date();

      if (req.query.from) {
        fromDate = new Date(req.query.from);
      }

      if (req.query.to) {
        toDate = new Date(req.query.to);
      }

      fromDate = fromDate.getTime();
      toDate = toDate.getTime();

      resObj.log = resObj.log.filter((session) => {
        let sessionDate = new Date(session.date).getTime();

        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }

    if (req.query.limit) {
      resObj.log = resObj.log.slice(0, req.query.limit);
    }

    resObj = resObj.toJSON();
    resObj['count'] = findIdUser.log.length;
    console.log(resObj);
    res.json(resObj);
  } catch (err) {
    return console.log(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
