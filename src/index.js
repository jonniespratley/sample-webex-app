const config = require("dotenv").config();
const express = require("express");
const morgan = require('morgan');
const path = require('path');
const app = express();

const { PORT = 8080 } = process.env;

app.use(morgan('tiny'))
app.use((req, res, next) => {
  next();
});

app.get("/callback", (req, res) => {
  res.status(200).send(req.query);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.listen(PORT, () => {
  console.log(`Started listening on port ${PORT}`);
});
/*
http
  .createServer(function (req, res) {
    res.write("Hello World!");
    res.end();
  })
  .listen(8080); //the server object listens on port 8080
  */
