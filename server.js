// ==================================================
// IMPORTS
// ==================================================
const express = require("express");
const Datastore = require("nedb");
const app = express();
require("dotenv").config();

// ==================================================
// VARIABLES
// ==================================================
const PORT = process.env.PORT || 3000;
let USER_DATA;

// ==================================================
// EXPRESS APP RENDERING
// ==================================================
app.listen(PORT, () => console.log(`listening at ${PORT}`));

app.use(express.static("public"));
app.use(express.json());

// set path to static files
app.get("/", (req, res) => {
  res.sendFile("./public/index.html", { root: __dirname });
});

app.get("/auth", (req, res) => {
  res.sendFile("./public/auth.html", { root: __dirname });
});

app.get("/home", (req, res) => {
  // check if there is user already logged in
  if (!USER_DATA) {
    res.status(404).sendFile("./public/404.html", { root: __dirname });
  } else {
    res.sendFile("./public/home.html", { root: __dirname });
  }
});

app.get("/dashboard", (req, res) => {
  res.sendFile("./public/dashboard.html", { root: __dirname });
});

app.get("/404", (req, res) => {
  res.status(404).sendFile("./public/404.html", { root: __dirname });
});

// ==================================================
// DATABASE [NeDB]
// ==================================================
const database = new Datastore("./database/database.db");
database.loadDatabase();

// ==================================================
// APIs
// ==================================================
// INSERT USERS
app.get("/createUser", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});
app.post("/createUser", (request, response) => {
  console.log("Server got a request!");
  const data = request.body;
  database.insert(data);
  response.json(data);
});

// SAVE USER DATA
app.get("/saveData", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    const user = USER_DATA;
    response.json(user);
  });
});
app.post("/saveData", (request, response) => {
  console.log("Server got a request!");
  USER_DATA = request.body;
  console.log(USER_DATA);
  response.json(USER_DATA);
});

// INSERT RECORDS
app.get("/record", (request, response) => {
  database.find({ username: USER_DATA.username }, (err, data) => {
    if (err) {
      response.end();
      return;
    }

    try {
      response.json(data[0].record);
    } catch (error) {
      console.log("ERROR AT RECORD API: GET METHOD");
    }
  });
});
app.post("/record", (request, response) => {
  console.log("Server got a request!");
  const data = request.body;
  console.log("data", data);
  database.update(
    { username: USER_DATA.username },
    { $push: { record: data } }
  );
  response.json(data);
});

// UPDATE HEIGHT
app.get("/updateHeight", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    const user = USER_DATA;
    response.json(user);
  });
});

app.post("/updateHeight", (request, response) => {
  console.log("Server got a request!");
  let newHeight = request.body;
  console.log(USER_DATA.username);

  database.update(
    { username: USER_DATA.username },
    { $set: { height: newHeight.height } },
    (err, numReplaced) => {
      if (err) {
        response.end();
        console.log(err);
        return;
      }
    }
  );

  response.json(USER_DATA);
});

// UPDATE WEIGHT
app.get("/updateWeight", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    const user = USER_DATA;
    response.json(user);
  });
});

app.post("/updateWeight", (request, response) => {
  console.log("Server got a request to update weight!");
  let { date, weight, oldWeight } = request.body;
  console.log(date, weight, oldWeight);
  console.log(USER_DATA.username);

  // pull old weight data
  database.update(
    { username: USER_DATA.username },
    { $pull: { record: { date: date, weight: oldWeight } } },
    (err, numReplaced) => {
      if (err) {
        response.end();
        console.log(err);
        return;
      }
    }
  );

  // push new weight data
  database.update(
    { username: USER_DATA.username },
    { $push: { record: { date: date, weight: weight } } },
    (err, numReplaced) => {
      if (err) {
        response.end();
        console.log(err);
        return;
      }
    }
  );

  response.json(USER_DATA);
});

// ==================================================
// ERROR 404 PAGE
// ==================================================
app.use((req, res) => {
  res.status(404).sendFile("./public/404.html", { root: __dirname });
});
