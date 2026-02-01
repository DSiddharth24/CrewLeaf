const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes imports (to be created)
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Crewlief Backend API is running' });
});

// App routes
app.use('/users', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/fields', fieldRoutes);
app.use('/attendance', attendanceRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
