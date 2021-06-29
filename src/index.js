const config = require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
var exphbs = require('express-handlebars');

const path = require("path");
const Webex = require("webex");
const assert = require("assert");


/**
 * Bot token
 * ZjQ3NzI2OTktNDBmZi00ZjYzLWJmOWQtMjI2ZDQwMGFmZTA0Y2M5YzY4ZmQtYzhl_PF84_1eb65fdf-9643-417f-9974-ad72cae0e10f
 * @type {number}
 */

const {
  PORT = 8080,
  APP_AUTH_URL,
  APP_CLIENT_ID,
  APP_CLIENT_SECRET,
  WEBEX_ACCESS_TOKEN = 'ZjQ3NzI2OTktNDBmZi00ZjYzLWJmOWQtMjI2ZDQwMGFmZTA0Y2M5YzY4ZmQtYzhl_PF84_1eb65fdf-9643-417f-9974-ad72cae0e10f'
} = process.env;


const webexConfig = {
  client_id: APP_CLIENT_ID,
  client_secret: APP_CLIENT_SECRET,
  redirect_uri: 'http://localhost:8080/callback',
  scope: 'meeting:schedules_write'
}

function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}
function errorHandler(err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}

// Create new express app
const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, '../views'));


app.use(morgan("common"));

const webexInstance = Webex.init({
  config: {
    credentials: webexConfig,
  },
});

app.use(function (req, res, next) {
  if(!req.webex){
    req.webex = webexInstance;
    req.webex.once("ready", next);
  }
  next();
});


/**
 * This should build the login URL and redirect.
 * 
 * Example URL from dev portal:
 * 
 * https://webexapis.com/v1/authorize?client_id=C223c9044ebbf692d395673bc4ee4ff86c54fa17081f8ffc3db66b3f00489765c&response_type=code
 * &redirect_uri=https%3A%2F%2Foauth.pstmn.io%2Fv1%2Fcallback&scope=meeting%3Arecordings_read%20spark%3Aall%20meeting%3Aparticipants_read%20analytics%3Aread_all%20meeting%3Aadmin_participants_read%20meeting%3Apreferences_write%20meeting%3Aadmin_recordings_read%20spark-admin%3Aworkspace_metrics_read%20spark-admin%3Aplaces_read%20meeting%3Aschedules_write%20spark-admin%3Adevices_read%20meeting%3Acontrols_read%20spark-compliance%3Amessages_read%20meeting%3Aadmin_schedule_read%20spark-admin%3Adevices_write%20spark-admin%3Aworkspaces_write%20meeting%3Aadmin_schedule_write%20meeting%3Aschedules_read%20meeting%3Arecordings_write%20meeting%3Apreferences_read%20spark-admin%3Aworkspace_locations_read%20spark-admin%3Aworkspaces_read%20spark-compliance%3Arooms_read%20spark-compliance%3Amessages_write%20spark%3Akms%20meeting%3Acontrols_write%20meeting%3Aadmin_recordings_write%20audit%3Aevents_read%20spark-admin%3Aplaces_write%20meeting%3Aparticipants_write%20spark-compliance%3Arooms_write&state=set_state_here
 */
app.get(`/login`, (req, res) => {
  let url = req.webex.credentials.buildLoginUrl({ clientType: "confidential" });
  console.log("build login url", url);

  res.redirect(url).end();
});


app.get('/debug', (req, res) => {
  const { query, headers } = req;
  res.status(200).send({ query, headers });
})

/**
 * Handle callback and get code from query
 */
app.get(`/callback`, (req, res, next) => {
  const { code } = req.query;

  console.log('\ncallback', req.params, req.query);

  assert(code);
  req.webex.authorization
    .requestAuthorizationCodeGrant(req.query)
    .then(() => {
      return res.redirect(`/`);
    })
    .catch(next);
});


app.get("/", (req, res) => {
  res.render('home');
});

app.use(logErrors)
app.use(errorHandler)
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
