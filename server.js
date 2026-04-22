const express = require('express');
const fs = require('fs').promises; // Sử dụng bản async để tối ưu hiệu năng
const { existsSync, writeFileSync } = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình file lưu trữ
const DATA_FILE = './users.json';
const MESSAGES_FILE = './messages.json';
const uploadDir = './uploads';

// Khởi tạo thư mục và file nếu chưa tồn tại
if (!existsSync(uploadDir)) writeFileSync(uploadDir, ''); // Tạo folder
if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, JSON.stringify([]));
if (!existsSync(MESSAGES_FILE)) writeFileSync(MESSAGES_FILE, JSON.stringify([]));

// Cấu hình Multer để upload ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. Upload ảnh đại diện
app.post('/api/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).send({ error: 'Không có file nào được tải lên' });
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.send({ imageUrl });
});

// 2. Đăng ký / Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await fs.readFile(DATA_FILE, 'utf8');
        let users = JSON.parse(data);

        let user = users.find(u => u.email === email);

        if (!user) {
            // Đăng ký mới: Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);
            user = { 
                id: Date.now().toString(),
                email, 
                password: hashedPassword, 
                fullName: '', gender: '', birthday: '', bio: '', 
                detailBio: '', avatar: '', location: '', hobbies: '' 
            };
            users.push(user);
            await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
        } else {
            // Đăng nhập: Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).send({ error: 'Mật khẩu không chính xác' });
        }

        // Không gửi mật khẩu về phía client
        const { password: _, ...userWithoutPassword } = user;
        res.send({ user: userWithoutPassword });
    } catch (error) {
        res.status(500).send({ error: 'Lỗi server khi đăng nhập' });
    }
});

// 3. Cập nhật hồ sơ
app.put('/api/update', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        let users = JSON.parse(data);
        const index = users.findIndex(u => u.email === req.body.email);

        if (index !== -1) {
            // Giữ lại mật khẩu cũ, chỉ cập nhật thông tin khác
            users[index] = { ...users[index], ...req.body, password: users[index].password };
            await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
            
            const { password, ...safeUser } = users[index];
            res.send({ success: true, user: safeUser });
        } else {
            res.status(404).send({ error: 'Người dùng không tồn tại' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Lỗi khi cập nhật hồ sơ' });
    }
});

// 4. Lấy danh sách người dùng (ẩn mật khẩu)
app.get('/api/users', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const users = JSON.parse(data).map(({ password, ...u }) => u);
        res.send(users);
    } catch (error) {
        res.send([]);
    }
});

// 5. Gửi tin nhắn
app.post('/api/messages/send', async (req, res) => {
    try {
        const { from, to, text } = req.body;
        const data = await fs.readFile(MESSAGES_FILE, 'utf8');
        let messages = JSON.parse(data);

        const newMsg = { 
            id: Date.now().toString(),
            from, to, text, 
            time: new Date().toISOString() 
        };
        
        messages.push(newMsg);
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        res.send({ success: true, message: newMsg });
    } catch (error) {
        res.status(500).send({ error: 'Lỗi khi gửi tin nhắn' });
    }
});

// 6. Lấy lịch sử chat
app.get('/api/messages/:u1/:u2', async (req, res) => {
    try {
        const { u1, u2 } = req.params;
        const data = await fs.readFile(MESSAGES_FILE, 'utf8');
        let messages = JSON.parse(data);

        let history = messages.filter(m => 
            (m.from === u1 && m.to === u2) || (m.from === u2 && m.to === u1)
        );
        res.send(history);
    } catch (error) {
        res.send([]);
    }
});

app.listen(PORT, () => console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`));