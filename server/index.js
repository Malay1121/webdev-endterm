const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groups");
const expenseRoutes = require("./routes/expenses");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);

const clientBuild = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuild));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => {
    console.log("DB connection error", err.message);
    process.exit(1);
  });
