const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
const dbPath = path.join(__dirname, "userData.db");

app.use(express.json());
let db = null;
module.exports = app;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `select * from user where username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    //New user
    const createUserQuery = `insert into user (username,name,password,gender,location) values
            ('${username}','${name}','${password}','${gender}','${location}');`;
    await db.run(createUserQuery);
    //Check for password length
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      response.status(200);

      response.send("User created successfully");
    }
  } else {
    //User already exist
    response.status(400);
    response.send("User already exist");
  }
});

app.listen(3000, () => {
  console.log("Server is running");
});
