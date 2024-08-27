const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 5000;
const dotenv = require('dotenv');

app.use(express.json());
dotenv.config();

// Create connection to MySQL database
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD, // Your MySQL root password
    database: process.env.DBNAME
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the MySQL database');
});

app.get('/',async(req,res) => {
    res.status(200).json('Server is Running Successfully...');
})

app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add school' });
        }
        res.status(200).json({ message: 'School added successfully' });
    });
});

app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Please provide latitude and longitude' });
    }

    const query = 'SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM schools ORDER BY distance';

    db.query(query, [latitude, longitude, latitude], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Failed to list schools' });
        }
        res.status(200).json(results);
    });
});


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
