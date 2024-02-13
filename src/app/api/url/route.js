import { NextResponse } from "next/server";
import http from "http";

// Function to get location information from IP2Location API
function getLocationInfo(clientIP) {
  const apiKey = "679B651088DB029D1D59E06765F691FF";
  const apiUrl = `https://api.ip2location.io/?key=${apiKey}&ip=${clientIP}`;

  return new Promise((resolve, reject) => {
    http
      .get(apiUrl, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// To handle a GET request to /api
export async function GET(request) {
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
      request.connection.remoteAddress;

    if (!clientIP) {
      throw new Error("Client IP address not found in headers.");
    }

    const locationInfo = await getLocationInfo(clientIP);
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

// To handle a POST request to /api
export async function POST(request) {
  // Do whatever you want
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}
