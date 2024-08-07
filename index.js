const express = require("express");
const bodyParser = require('body-parser');
const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;
const uuid = require("uuid");
const speakeasy = require("speakeasy");
const nodemailer = require('nodemailer');

const app = express();

app.use(express.static('public'));
/**
 * Creates a node-json-db database config
 * @param {string} name - name of the JSON storage file
 * @param {boolean} Tells the to save on each push otherwise the save() mthod has to be called.
 * @param {boolean} Instructs JsonDB to save the database in human readable format
 * @param {string} separator - the separator to use when accessing database values
 */

const dbConfig = new Config("myDataBase", true, false, '/')

/**
 * Creates a Node-json-db JSON storage file
 * @param {instance} dbConfig - Node-json-db configuration
 */

const db = new JsonDB(dbConfig);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/api", (req,res) => {
  res.json({ message: "Welcome to the two factor authentication example" })
});


async function registerUser() {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // You might need to send additional data, like user details, if required
      body: JSON.stringify({}),
    });

    const data = await response.json();
    if (response.ok) {
      // Display the registration message to the user
      document.getElementById('registrationMessage').innerText = `User registered. ID: ${data.id}, Secret: ${data.secret}`;
    } else {
      document.getElementById('registrationMessage').innerText = 'Registration failed';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('registrationMessage').innerText = 'An error occurred during registration';
  }
}

app.post("/api/register", (req, res) => {
    const id = uuid.v4();
    try {
      const path = `/user/${id}`;
      // Create temporary secret until it it verified
      const temp_secret = speakeasy.generateSecret();
      // Create user in the database
      db.push(path, {id, temp_secret});
      // Send user id and base32 key to user
      res.json({ id, secret: temp_secret.base32 })
    } catch(e) {
      console.log(e);
      res.status(500).json({ message: `Error generating secret key`})
    }
})

app.post("/api/verify", (req, res) => {
  const { userId, token } = req.body;
  try {
    // Retrieve user from the database
    const path = `/user/${userId}`;
    db.getData(path)
      .then(user => {
        // Log the user object to inspect its contents
        console.log("User object:", user);

        // Ensure that the temp_secret is retrieved correctly
        const { base32: secret = undefined } = user.temp_secret || {};

        // Log the retrieved secret to check if it is accessible
        console.log("Retrieved Secret:", secret);

        // Perform the verification process
        const verified = speakeasy.totp.verify({
          secret,
          encoding: 'base32', // Ensure the encoding is consistent
          token
        });

        // Handle the verification result
        if (verified) {
          // Update user data
          db.push(path, { id: userId, secret: user.temp_secret ? user.temp_secret.base32 : undefined });
          res.json({ verified: true });
        } else {
          res.json({ verified: false });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
});

app.post("/api/validate", async (request, response) => {
  try {
    const { userId, token } = request.body;
    const path = `/user/${userId}`;
    
    // Retrieving user from the database
    const user = await db.getData(path);
    console.log({ user });

    if (user) {
      // Check if the user has a temporary secret or a permanent secret
      const secret = user.temp_secret ? user.temp_secret.base32 : user.secret;

      const tokenValidates = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 7
      });

      if (tokenValidates) {
        response.json({ validated: true });
      } else {
        response.json({ validated: false });
      }
    } else {
      response.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: 'Error retrieving user' });
  }
});


const port = 9000;
app.listen(port, () => {
  console.log(`App is running on PORT: ${port}.`);
});

