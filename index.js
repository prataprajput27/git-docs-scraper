require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");

const app = express();
const PORT = 3000;

// cors middleware
app.use(cors());

// middleware for parsing JSON
app.use(express.json());

// use routes
app.use("/api/files", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
