const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Corrected Import Paths
const authRouter = require("./src/routes/auth");
const categoryRouter = require("./src/routes/categories");
const productRouter = require("./src/routes/products");
const brainTreeRouter = require("./src/routes/braintree");
const orderRouter = require("./src/routes/orders");
const usersRouter = require("./src/routes/users");
const customizeRouter = require("./src/routes/customize");

// Auth Middleware
const { loginCheck } = require("./src/middleware/auth");

// ⚠️ REMOVE CreateAllFolder() because Vercel cannot create folders
// const CreateAllFolder = require("./src/config/uploadFolderCreateScript");
// CreateAllFolder();

// Database Connection
mongoose
  .connect(process.env.DATABASE)
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log("Database Not Connected !!!", err));

  // Default route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the API!"); // Or any custom message
});


// Middlewares
app.use(morgan("dev"));
app.use(cookieParser());

const allowedOrigins = [
  "https://zainabkhan87.github.io/mern-ecommerce-project",
  "http://localhost:3000", // if you want local dev also
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));




app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api", brainTreeRouter);
app.use("/api/order", orderRouter);
app.use("/api/customize", customizeRouter);

// ❌ REMOVE app.listen()
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log("Server is running on", PORT);
// });

module.exports = app; // ✅ Just export app
