const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, 'database.json');

const readDB = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch(e) {
        return { users: [], catalog: [], games: [] };
    }
};

const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// --- API ---

app.get('/api/catalog', (req, res) => res.json(readDB().catalog || []));

app.get('/api/user/:username', (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.username === req.params.username);
    if(user) res.json(user); else res.status(404).send();
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, message: 'Hata!' });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    if(db.users.find(u => u.username === username)) return res.status(400).json({ success: false, message: 'Alınmış!' });
    const newUser = {
        username, password, tix: 50, robux: 10, inventory: [], 
        avatar: { color: "#ffcc00", shirt: null, pants: null, hat: null, face: null },
        friends: [], bio: "Hoş geldiniz!"
    };
    db.users.push(newUser);
    writeDB(db);
    res.json({ success: true, user: newUser });
});

app.post('/api/buy', (req, res) => {
    const { username, itemId } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.username === username);
    const item = db.catalog.find(i => i.id === itemId);
    if(!user || !item) return res.status(404).send();
    if(!user.inventory) user.inventory = [];
    if(user.inventory.includes(itemId)) return res.status(400).send();
    if(user.robux >= item.price) {
        user.robux -= item.price;
        user.inventory.push(itemId);
        writeDB(db);
        res.json({ success: true, robux: user.robux, inventory: user.inventory });
    } else res.status(400).send();
});

app.post('/api/update-avatar', (req, res) => {
    const { username, avatarConfig } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.username === username);
    if (user) { user.avatar = avatarConfig; writeDB(db); res.json({ success: true }); }
    else res.status(404).send();
});

app.listen(PORT, () => {
    console.log(`ROGNIX Sunucusu http://localhost:${PORT} adresinde aktif.`);
});