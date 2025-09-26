
require('dotenv').config();
const express = require('express');
const db = require('./config/conn');


const app = express();
const PORT = process.env.PORT || 3000;


app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
	if (req.method === 'OPTIONS') return res.sendStatus(200);
	
	if (req.path.startsWith('/api/') && req.method !== 'GET' && !req.is('application/json')) {
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

// Student upload routes
const uploadStudentRoutes = require('./routes/uploadstudent');
app.use('/api/student', uploadStudentRoutes);

app.get('/', (req, res) => {
	res.send('Server is running and connected to MySQL!');
});

app.listen(PORT, () => {
	console.log(`Server started on port http://localhost:${PORT}`);
});
