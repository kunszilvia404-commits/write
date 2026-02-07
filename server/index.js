require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const diagnoseRoutes = require('./routes/diagnose');
const ideationRoutes = require('./routes/ideation');
const plansRoutes = require('./routes/plans');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/diagnose', diagnoseRoutes);
app.use('/api/ideation', ideationRoutes);
app.use('/api/plans', plansRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'WriteWay server is running' });
});

app.listen(PORT, () => {
  console.log(`WriteWay server running on port ${PORT}`);
});
