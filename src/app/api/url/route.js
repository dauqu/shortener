import { NextResponse } from "next/server";
import http from "http";

// Function to get public IP address
function getPublicIPAddress() {
  return new Promise((resolve, reject) => {
    http
      .get({ host: "api.ipify.org", port: 80, path: "/" }, function (resp) {
        let ip = "";
        resp.on("data", function (chunk) {
          ip += chunk;
        });
        resp.on("end", function () {
          resolve(ip);
        });
      })
      .on("error", function (err) {
        reject(err);
      });
  });
}

// To handle a GET request to /api
// export async function GET(request) {
//   try {
//     const ip = await getPublicIPAddress();
//     return new Response(JSON.stringify({ ip }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error fetching IP address:", error);
//     return new Response(JSON.stringify({ error: "Internal Server Error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

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
      request.headers.get("req.connection.remoteAddress");
    return new Response(JSON.stringify({ clientIP }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client IP address:", error);
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
