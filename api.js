import axios from "axios";
import Redis from "ioredis";
import cors from "cors";
import express from "express";

const redisClient = Redis.createClient({ port: 6379, host: "127.0.0.1" });
const app = express();
app.use(cors());

app.get("/photos", async (req, res) => {
  let catchEntry = await redisClient.get("photos");
  // console.log(catchEntry);
  if (catchEntry) {
    console.log("Catch hit");
    catchEntry = JSON.parse(catchEntry);
    return res.json(catchEntry);
  } else {
    console.log("catch missed");
    let apiResponse = await axios.get(
      "https://jsonplaceholder.typicode.com/photos"
    );
    redisClient.set(`photos`, JSON.stringify(apiResponse.data));
    return res.json({ ...apiResponse.data, source: "API" });
  }
});

app.get("/photos/:id", async (req, res) => {
  let catchEntry = await redisClient.get(`photos:${req.params.id}`);
  if (catchEntry) {
    console.log("Catch hit");
    catchEntry = JSON.parse(catchEntry);
    return res.json(catchEntry);
  } else {
    console.log("catch missed");
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );
    redisClient.set(`photos:${req.params.id}`, JSON.stringify(data));
    return res.json(JSON.stringify(data));
  }
});

app.listen(3002);

// if (photos != null) {
//   console.log("Cache hit");
//   let data = res.json(JSON.parse({ ...photos, source: "Catch" }));
//   return { ...data, source: "Cache" };
// } else {
//   console.log("Cache missed", photos);
//   const { data } = await axios.get(
//     "https://jsonplaceholder.typicode.com/photos",
//     { params: { albumId } }
//   );
//   redisClient.set("photos", JSON.stringify(data));
//   return res.json({ ...data, source: "API" });
// }
// }
