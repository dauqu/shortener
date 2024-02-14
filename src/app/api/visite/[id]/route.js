import { NextResponse } from "next/server";
import fetch from "node-fetch"; // Assuming you're using Node.js and have node-fetch installed
const sqlite3 = require("sqlite3").verbose();

// Function to get location information from IP2Location API
async function getLocationInfo(clientIP) {
  const apiKey = "679B651088DB029D1D59E06765F691FF";
  const apiUrl = `https://api.ip2location.io/?key=${apiKey}&ip=${clientIP}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Error fetching location information:", error);
  }
}

// To handle a GET request to /api
export async function GET(request, { params }) {
  try {
    const clientIP =
      request.headers.get("X-Forwarded-For") ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("Fastly-Client-IP") ||
      request.headers.get("fastly-client-ip") ||
      request.headers.get("True-Client-IP") ||
      request.headers.get("true-client-ip") ||
      request.headers.get("X-Real-IP") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("X-Appengine-User-Ip") ||
      request.headers.get("x-appengine-user-ip") ||
      request.headers.get("req.connection.remoteAddress");

    if (!clientIP) {
      throw new Error("Client IP address not found in headers.");
    }

    const userAgent = request.headers.get("User-Agent");

    const locationInfo = await getLocationInfo(clientIP);

    //Date
    const date = new Date().toISOString(); // Example date value

    // Example usage:
    const link = params.id; // Replace with the actual link you want to retrieve data for
    console.log(params.id);
    // Get data by Link
    getDataByLink(link, (err, data) => {
      if (err) {
        return new Response(JSON.stringify({ error: err }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // console.log(JSON.stringify(data, null, 2));
        console.log(data);
        saveData(data.id, locationInfo, userAgent, date);
      }
    });

    // console.log(link_data);
    // Save data in database
    // saveData(1, locationInfo, userAgent, date);

    //Return Response
    return new Response(JSON.stringify(locationInfo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Function to save data into SQLite database
// Function to save data into SQLite database
function saveData(link_id, location, userAgent, date) {
  return new Promise((resolve, reject) => {
    // Open or create a SQLite database
    const db = new sqlite3.Database("data.db");

    // Create a table if it doesn't exist
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY,
        link_id TEXT,
        user_agent TEXT,
        ip TEXT,
        country_code TEXT,
        country_name TEXT,
        region_name TEXT,
        city_name TEXT,
        latitude TEXT,
        longitude TEXT,
        zip_code TEXT,
        time_zone TEXT,
        "as" TEXT,
        is_proxy INTEGER,
        date TEXT
    );`);

      // Insert data into the table
      db.run(
        `INSERT INTO visitors (link_id, user_agent, ip, country_code, country_name, region_name, city_name, latitude, longitude, zip_code, time_zone, "as", is_proxy, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          link_id,
          userAgent,
          location.ip,
          location.country_code,
          location.country_name,
          location.region_name,
          location.city_name,
          location.latitude,
          location.longitude,
          location.zip_code,
          location.time_zone,
          location.as,
          location.is_proxy,
          date,
        ],
        function (err) {
          if (err) {
            console.error("Error inserting data:", err.message);
            reject(err);
          } else {
            console.log(`Data inserted successfully with rowid ${this.lastID}`);
            resolve();
          }
        }
      );

      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
          reject(err);
        } else {
          console.log("Database connection closed.");
        }
      });
    });
  });
}

// Function to retrieve data by link and return JSON data
function getDataByLink(link, callback) {
  const db = new sqlite3.Database("data.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
      callback(err);
    }
    console.log("Connected to the database.");
  });

  const sql = `SELECT * FROM links WHERE link = ?`;

  db.get(sql, [link], (err, row) => {
    if (err) {
      console.error(err.message);
      callback(err);
    }
    if (row) {
      callback(null, row);
    } else {
      callback("No data found with the specified ID.", null);
    }
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
      callback(err);
    }
    console.log("Closed the database connection.");
  });
}

// To handle a POST request to /api
export async function POST(request) {
  try {
    const db = new sqlite3.Database("data.db");
    const query = `SELECT * FROM visitors`;

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
