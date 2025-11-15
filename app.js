require("dotenv").config();
require('express-async-errors');

const connectDB = require("./db/connect");
const express = require("express");
const cors = require('cors')
const app = express();
const mainRouter = require("./routes/user");
const checkInRouter = require("./routes/checkIn");

app.use(express.json());

app.use(cors())

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/v1", mainRouter);
app.use("/api/v1/check-in", checkInRouter);

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, 'client', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
    });
}

const port = process.env.PORT || 3000;

const start = async () => {
    try {        
        await connectDB(process.env.MONGO_URI);
        app.listen(port, '0.0.0.0', () => {
            const os = require('os');
            const networkInterfaces = os.networkInterfaces();
            let localIP = 'localhost';
            
            // Find the local IP address
            Object.keys(networkInterfaces).forEach((ifname) => {
                networkInterfaces[ifname].forEach((iface) => {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        localIP = iface.address;
                    }
                });
            });
            
            console.log(`Server is running at:`);
            console.log(`- Local:   http://localhost:${port}`);
            console.log(`- Network: http://${localIP}:${port}`);
        })

    } catch (error) {
       console.log(error); 
    }
}

start();

