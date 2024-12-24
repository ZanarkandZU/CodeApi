require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let count = 0;
let dataUrl = {};
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  count++;

  const parsedUrl = new URL(url);

  if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
    dataUrl[count] = url;
    res.json({ original_url: url, short_url: count });
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short?', (req, res) => {
  const { short } = req.params;
  if (dataUrl[short]) {
    res.redirect(dataUrl[short]);
  } else {
    res.json({ error: 'invalid url' });
  }
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
