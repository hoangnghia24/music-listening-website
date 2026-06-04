const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Parse JSON body

// Routes cơ bản
app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend Express.js đang hoạt động tốt!', status: 200 });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});