export async function GET(request) {
  const ipAddress = request; // Cloudflare example, adjust accordingly

  // Return response with location information
  return Response.json({ 
    data: request.headers['x-forwarded-for']
  });
}
