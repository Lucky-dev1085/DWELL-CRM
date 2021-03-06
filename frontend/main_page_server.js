const path = require('path');
const express = require('express');

const DIST_DIR = path.join(__dirname, '/static/bundles');
const PORT = 8080;
const app = express();

//Serving the files on the dist folder
app.use(express.static(DIST_DIR));

app.use('/static', express.static('./static'));

//Send index.html when the user access the web
app.get('*', function (req, res) {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT);
