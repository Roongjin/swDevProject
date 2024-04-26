const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");

//Route files
const restaurants = require("./routes/restaurants");
const auth = require("./routes/auth");
// const reservations = require("./routes/reservations");
// const feedbacks = require("./routes/feedbacks");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(
  sessions({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    resave: true,
    saveUninitialized: false,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/auth", auth);
// app.use("/api/v1/reservations", reservations);
// app.use("/api/v1/feedbacks", feedbacks);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, "mode on PORT", PORT),
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});
