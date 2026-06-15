require('dotenv').config();
const connectDB = require('./config/db');
const express = require('express');

const app = express();

app.use(express.json());

// Manual CORS headers (works with Express 5 + Vercel serverless)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Middleware to ensure DB is connected for all API routes
app.use('/api', (req, res, next) => {
  connectDB().then(() => next()).catch(next);
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.get('/', (req, res) => {
  res.send('Timesheet Management System Backend Running');
});

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const timesheetRoutes = require('./routes/timesheets');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/users', userRoutes);

// Start server only when run directly (not when imported by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
