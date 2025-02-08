import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;
const apiKey = "AIzaSyDdQbX7kMDsGR23NA6kTu8G505Gg7iod9Y"; // Replace with your actual API key

app.use(cors()); // Enable CORS for all requests

app.get("/places", async (req, res) => {
  const { location, radius, type } = req.query;

  if (!location || !radius || !type) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching Places API:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch data from Google Places API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
