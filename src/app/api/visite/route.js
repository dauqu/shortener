import { NextResponse } from "next/server";
const sqlite3 = require("sqlite3").verbose();

// To handle a POST request to /api
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("link_id");
    let db = new sqlite3.Database("data.db");

    // Define the SQL query based on the query parameter
    let sqlQuery;
    if (param) {
      sqlQuery = `SELECT * FROM visitors WHERE link_id = ?`;
    } else {
      sqlQuery = `SELECT * FROM visitors`;
    }

    // Wrap the database operation in a promise
    const fetchData = () => {
      return new Promise((resolve, reject) => {
        db.all(sqlQuery, [param], (err, rows) => {
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
