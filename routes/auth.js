// Register Route
app.post('/api/register', (req, res) => {
    const { full_name, username, password } = req.body;

    // First check if username already exists
    const checkUser = "SELECT * FROM users WHERE username = ?";
    db.query(checkUser, [username], (err, result) => {
        if (result.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Insert new user
        const sql = "INSERT INTO users (full_name, username, password) VALUES (?, ?, ?)";
        db.query(sql, [full_name, username, password], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "User created successfully" });
        });
    });
});