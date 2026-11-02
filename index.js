const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: false }))

let user = [];

app.post('/api/users', function(req, res) {
  let username = req.body.username;
  let id = String(user.length+1);
  user.push({username, id, log: []});
  res.json({username: username,
    _id: id});
});

app.post('/api/users/:_id/exercises', function(req, res) {
  let id = req.params._id;
  if (!user[id-1]) {
    return res.json({error: "User not found"});
  }

  let desc = req.body.description;
  let dur = Number(req.body.duration);
  let date = req.body.date ? new Date(req.body.date) : new Date();
  let dateString = date.toDateString();

  user[id-1].log.push({
    description: desc,
    duration: dur,
    date: dateString
  });

  res.json({username: user[id-1].username,
    description: desc,
    duration: dur,
    date: dateString,
    _id: id});
});

app.get('/api/users/:_id/logs', function(req, res) {
  let id = req.params._id;
  let found = user[id - 1];

  if (!found) {
    return res.json({ error: "User not found" });
  }

  let log = found.log;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;

  if (from) {
    let fromDate = new Date(from);
    log = log.filter(function (e) {
      return new Date(e.date) >= fromDate;
    });
  }
  if (to) {
    let toDate = new Date(to);
    log = log.filter(function (e) {
      return new Date(e.date) <= toDate;
    });
  }
  if (limit) {
    log = log.slice(0, Number(limit));
  }

  res.json({
    username: found.username,
    count: log.length,
    _id: found.id,
    log: log
  });
});

app.get('/api/users', function (req, res) {
  let result = [];
  for (let i = 0; i < user.length; i++) {
    result.push({ username: user[i].username, _id: user[i].id });
  }
  res.json(result);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
