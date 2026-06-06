const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Import pool kết nối vừa tạo
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// API 1: Lấy toàn bộ danh sách bài hát hoặc tra cứu theo từ khóa (LIKE)
app.get('/api/songs', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM Songs';
        let params = [];

        // Nếu có tham số tìm kiếm, áp dụng quy định tra cứu gần đúng QĐ2
        if (search) {
            query = 'SELECT * FROM Songs WHERE title LIKE ? OR artist LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API 2: Tính tổng thời lượng của một Playlist cụ thể
app.get('/api/playlists/:id/duration', async (req, res) => {
    try {
        const playlistId = req.params.id;
        const query = `
            SELECT SUM(s.duration) as total_duration 
            FROM Playlist_Details pd
            JOIN Songs s ON pd.song_id = s.song_id
            WHERE pd.playlist_id = ?
        `;
        const [rows] = await pool.query(query, [playlistId]);
        res.json({ success: true, total_seconds: rows[0].total_duration || 0 });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));