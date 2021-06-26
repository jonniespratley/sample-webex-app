const config = require("dotenv").config();

const express = require("express");
const app = express();

const http = require("http");

console.log(config);

//create a server object:

app.use((req, res, next) => {
  console.log(req);
  next();
});

app.get("/callback", (req, res) => {
  res.status(200).send(req.query);
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(8080, () => {
  console.log("running..");
});
/*
http
  .createServer(function (req, res) {
    res.write("Hello World!");
    res.end(); 
  })
  .listen(8080); //the server object listens on port 8080
  */
