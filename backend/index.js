require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const redis = require('redis'); // 👈 added redis
const app = express();
const port = 3000;

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Redis connection
const redisClient = redis.createClient({
  url: 'redis://redis:6379'
});

redisClient.connect()
  .then(() => console.log('Connected to Redis.'))
  .catch(err => console.error('Redis connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js + Express + MySQL!');
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

app.get('/cache', async (req, res) => {
  try {
    await redisClient.set('testKey', 'Hello from Redis!');
    const value = await redisClient.get('testKey');
    res.send(`Redis says: ${value}`);
  } catch (err) {
    res.status(500).send('Redis error: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
