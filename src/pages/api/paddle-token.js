export default function handler(req, res) {
  // This endpoint returns the Paddle client token from server-side env.
  // It prevents the token from being embedded at build time.
  // You can add authentication checks here if desired.
  const token = process.env.PADDLE_CLIENT_TOKEN || null;
  if (!token) {
    return res
      .status(500)
      .json({ error: "Paddle client token not configured on server." });
  }

  res.status(200).json({ token });
}
