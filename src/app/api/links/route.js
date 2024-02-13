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

    //Generate 5 digit rendome string
    const randomString = generateRandomString(5);

    //Date
    const date = new Date().toISOString(); // Example date value

    // Save Data
    saveData(randomString, data.link, data.title, date);

    //Make link
    const generatedLink = "https://localhost:3000/api/visite/" + randomString;

    return NextResponse.json({ message: generatedLink }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
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

// Save data
// Function to save data into SQLite database
function saveData(back_half, link, title, date) {
  // Open or create a SQLite database
  const db = new sqlite3.Database("data.db");

  // Create a table if it doesn't exist
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY,
            title TEXT,
            back_half TEXT,
            link TEXT,
            date TEXT
        )`);

    // Insert data into the table
    db.run(
      `INSERT INTO links (title, back_half, link, date) VALUES (?, ?, ?, ?)`,
      [title, back_half, link, date],
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

// To handle a DELETE request to /api/visit/:id
export async function DELETE(req, res) {
  try {
    const { id } = req.params; // Extract the ID from request parameters
    console.log(id);
    // Open the database connection
    const db = new sqlite3.Database("data.db");

    // Delete data from the table where the id matches
    db.run(`DELETE FROM links WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error("Error deleting data:", err.message);
        db.close();
        return NextResponse.json(
          { error: "Error deleting data" },
          { status: 500 }
        );
      } else {
        console.log(`Data deleted successfully for ID: ${id}`);
        db.close();
        return NextResponse.json(
          { message: "Data deleted successfully" },
          { status: 200 }
        );
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
