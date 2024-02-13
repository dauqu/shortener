import { NextResponse } from "next/server";
const sqlite3 = require("sqlite3").verbose();

// To handle a GET request to /api/data
export async function GET(req, res) {
  try {
    const db = new sqlite3.Database("data.db");
    const query = `SELECT * FROM links`;

    // Wrap the database operation in a promise
    const fetchData = () => {
      return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error("Error getting data:", err.message);
            db.close();
            reject({ error: "Error getting data" });
          } else {
            db.close();
            resolve(rows);
          }
        });
      });
    };

    // Await the promise
    const rows = await fetchData();

    // Return the response
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { data: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// To handle a POST request to /api
export async function POST(req, res) {
  try {
    const data = await req.json(); // Parse JSON data from request body

    // Generate unique link
    let randomString;
    let isUnique = false;
    while (!isUnique) {
      randomString = generateRandomString(5);
      isUnique = await isLinkUnique(randomString);
    }
    console.log(randomString);

    //Date
    const date = new Date().toISOString(); // Example date value

    // Save Data
    saveData(data.title, randomString, data.destination, "active", 0, date);

    //Make link
    const generatedLink = "https://localhost:3000/api/visite/" + randomString;

    return NextResponse.json({ message: generatedLink }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

// Function to check if link is unique
async function isLinkUnique(link) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("data.db");
    db.get("SELECT link FROM links WHERE link = ?", [link], (err, row) => {
      if (err) {
        console.error("Error checking link uniqueness:", err.message);
        reject(err);
      } else {
        resolve(!row); // Resolve true if link is unique, false if it already exists
      }
    });
    db.close();
  });
}

//Generate rendome string function
function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

// Function to save data into SQLite database
function saveData(title, link, destination, status, views, date) {
  // Open or create a SQLite database
  const db = new sqlite3.Database("data.db");

  // Create a table if it doesn't exist
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY,
      title TEXT,
      link TEXT UNIQUE,
      destination TEXT,
      status TEXT,
      views INTEGER,
      date TEXT
  );`);

    // Insert data into the table
    db.run(
      `INSERT INTO links (title, link, destination, status, views, date) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, link, destination, status, views, date],
      function (err) {
        if (err) {
          console.error("Error inserting data:", err.message);
        } else {
          console.log(`Data inserted successfully with rowid ${this.lastID}`);
        }
      }
    );

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  });
}

// Delete data
export async function DELETE(req, res) {
  try {
    const data = await req.json(); // Parse JSON data from request body
    const id = data.id;

    // Open the database connection
    const db = new sqlite3.Database("data.db");

    // Delete data from the table where the id matches
    // Wrap the database operation in a promise
    const deleteData = () => {
      return new Promise((resolve, reject) => {
        db.run(`DELETE FROM links WHERE id = ?`, [id], function (err) {
          if (err) {
            console.error("Error deleting data:", err.message);
            db.close();
            reject({ status: 500, message: "Error deleting data" }); // Reject with status 500 on error
          } else if (this.changes === 0) {
            // Check if no rows were affected
            console.log(`No data found for ID: ${id}`);
            db.close();
            reject({ status: 404, message: "Data not found" }); // Reject with status 404 if no data found
          } else {
            console.log(`Data deleted successfully for ID: ${id}`);
            db.close();
            resolve({ status: 200, message: "Data deleted successfully" }); // Resolve with status 200 on success
          }
        });
      });
    };

    // Await the promise
    const result = await deleteData();

    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    );
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
