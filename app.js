const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const express = require("express");
require("dotenv").config();
const cors = require("cors");

const mongoose = require("mongoose");

const userRoutes = require("./routes/user");


const app = express();

//HTTP headers
app.use(helmet());

app.use(cors());

//Against brute attack
const rateLimiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP, please try again in an hour!",
});
app.use("/api", rateLimiter);

app.use(express.json({
    limit: "10mb"
}));
app.use(
    express.urlencoded({
        limit: "10mb",
        extended: false,
        parameterLimit: 10000,
    })
);

//NoSQL query injection -Data Sanitization
app.use(mongoSanitize());

//xss attack -Data Sanitization
app.use(xss());

//HTTP parament pollution
app.use(hpp());

app.use("/api/v1/user", userRoutes);


app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to Track Line",
    });
});

//Handling unhandle routes
app.all("*", (req, res, next) => {
    return res.status(404).json({
        status: "Error 404",
        message: `Page not found. Can't find ${req.originalUrl} on this server`,
    });
});

const DB = process.env.CONNECTION_STRING

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then((c) => console.log("DATABASE connection successfull"));

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`App runing on port ${port}`);
});