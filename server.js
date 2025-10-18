const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Token-ul va fi setat în variabilele de mediu pe Render
const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_URL = 'https://api-inference.huggingface.co/models/readerbench/RoGPT2-large';

async function queryHuggingFace(prompt) {
    try {
        const response = await axios.post(HF_API_URL, {
            inputs: prompt,
            parameters: {
                max_length: 100,
                temperature: 0.7
            }
        }, {
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data[0]?.generated_text || 'Nu am putut genera răspuns.';
    } catch (error) {
        console.error('Eroare Hugging Face:', error);
        return 'Scuze, am o eroare temporară. Încearcă din nou!';
    }
}

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Mesajul este obligatoriu' });
    }

    try {
        // Folosim Hugging Face API
        const aiResponse = await queryHuggingFace(message);
        
        res.json({ 
            reply: aiResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Eroare server' });
    }
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chatbot Român AI</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                }
                .chat-container { 
                    background: rgba(255,255,255,0.1); 
                    border-radius: 15px; 
                    padding: 30px; 
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }
                input { 
                    padding: 15px; 
                    margin: 10px 0; 
                    border: none; 
                    border-radius: 25px; 
                    width: 70%;
                    font-size: 16px;
                }
                button { 
                    padding: 15px 25px; 
                    margin: 10px 0; 
                    border: none; 
                    border-radius: 25px; 
                    background: #4CAF50; 
                    color: white; 
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                }
                button:hover {
                    background: #45a049;
                    transform: translateY(-2px);
                }
                #response { 
                    margin-top: 20px; 
                    padding: 20px; 
                    background: rgba(255,255,255,0.2); 
                    border-radius: 10px; 
                    border-left: 4px solid #4CAF50;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <h1>🤖 Chatbot Român AI</h1>
                <input type="text" id="message" placeholder="💬 Scrie un mesaj..." autocomplete="off">
                <button onclick="sendMessage()">🚀 Trimite</button>
                <div id="response">👋 Salut! Scrie-mi ceva și voi răspunde!</div>
            </div>

            <script>
                async function sendMessage() {
                    const message = document.getElementById('message').value;
                    const responseDiv = document.getElementById('response');
                    
                    if (!message.trim()) return;
                    
                    responseDiv.innerHTML = '🤔 Se generează răspuns...';
                    
                    try {
                        const response = await fetch('/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: message })
                        });
                        const data = await response.json();
                        responseDiv.innerHTML = `<strong>🤖 Răspuns:</strong> ${data.reply}`;
                    } catch (error) {
                        responseDiv.innerHTML = '❌ Eroare de conexiune. Încearcă din nou.';
                    }
                    
                    document.getElementById('message').value = '';
                }

                // Enter key support
                document.getElementById('message').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });

                // Focus on input
                document.getElementById('message').focus();
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
