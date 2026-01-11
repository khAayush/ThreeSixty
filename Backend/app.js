const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const assetsRoutes = require('./routes/assetsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// database connection
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/categories', categoriesRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(process.env.PORT, () => {
    console.log(`Listening to requests on port: ${process.env.PORT}`);
});