
require('dotenv').config();
const express = require('express');
const db = require('./config/conn');


const app = express();
const PORT = process.env.PORT || 3000;



const allowedOrigin = 'http://192.168.137.131:8080'; 
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', allowedOrigin);
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	res.header('Access-Control-Allow-Credentials', 'true');
	if (req.method === 'OPTIONS') return res.sendStatus(200);

	if (
		req.path.startsWith('/api/') &&
		['POST', 'PUT', 'PATCH'].includes(req.method) &&
		!req.is('application/json')
	) {
		return res.status(415).json({ error: 'Only application/json is allowed' });
	}
	next();
});

app.use(express.json());



// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Department routes
const deptRoutes = require('./routes/dept');
app.use('/api/dept', deptRoutes);

// Student routes
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// Question routes
const questionRoutes = require('./routes/question');
app.use('/api/question', questionRoutes);

// Topic routes
const topicRoutes = require('./routes/topic');
app.use('/api/topic', topicRoutes);

// Test routes
const testRoutes = require('./routes/test');
app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
	res.send('Server is running and connected to MySQL!');
});

app.listen(PORT, () => {
	console.log(`Server started on port http://localhost:${PORT}`);
});
