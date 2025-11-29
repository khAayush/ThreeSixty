const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

app.use(express.json());

// Connect to MongoDB
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Listening to requests on port: ${process.env.PORT}`);
});