const config = require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const Webex = require("webex");
const assert = require("assert");
const app = express();

const {
  PORT = 8080,
  APP_AUTH_URL,
  APP_CLIENT_ID,
  APP_CLIENT_SECRET,
  WEBEX_ACCESS_TOKEN,
} = process.env;

app.use(morgan("dev"));
app.use((req, res, next) => {
  next();
});

const webexConfig = {
  client_id: APP_CLIENT_ID,
  client_secret: APP_CLIENT_SECRET
}

app.use(function (req, res, next) {
  req.webex = Webex.init({
    config: {
      credentials: webexConfig,
    },
  });

  req.webex.once("ready", next);
});

app.get(`/login`, (req, res) => {
  // buildLoginUrl() defaults to the implicit grant flow so explicitly pass
  // `confidential` to generate a URL suitable to the Authorization Code grant
  // flow.
  let url = req.webex.credentials.buildLoginUrl({ clientType: "confidential" });
  console.log("build login url", url);

  res.redirect(url).end();
});

app.get(`/callback`, (req, res, next) => {
  const { code } = req.query;
  console.log('callback', req.params, req.query);
  assert(code);

  req.webex.authorization
    .requestAuthorizationCodeGrant(req.query)
    .then(() => {
      res.redirect(`/`).end();
    })
    .catch(next);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
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
