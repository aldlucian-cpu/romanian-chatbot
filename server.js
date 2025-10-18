const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    // Simulăm răspuns chatbot
    const response = `🤖 Chatbot răspunde: "${message}"`;
    
    res.json({ reply: response });
});

app.get('/', (req, res) => {
    res.send('🚀 Chatbot Român este online!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
