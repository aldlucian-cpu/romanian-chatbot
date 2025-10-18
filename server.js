const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('public'));

// Token-ul securizat în variabile de mediu
const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_URL = 'https://api-inference.huggingface.co/models/readerbench/RoGPT2-large';

// Simulare inteligentă pentru testare
async function queryHuggingFace(prompt) {
    // Dacă nu e token, folosim simulare
    if (!HF_TOKEN) {
        return simulateAIResponse(prompt);
    }

    try {
        const response = await axios.post(HF_API_URL, {
            inputs: prompt,
            parameters: { max_length: 100, temperature: 0.7 }
        }, {
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        return response.data[0]?.generated_text || simulateAIResponse(prompt);
    } catch (error) {
        console.log('Folosim simulare:', error.message);
        return simulateAIResponse(prompt);
    }
}

// Simulare AI inteligentă în română
function simulateAIResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    const responses = {
        'salut': 'Salut! 😊 Cu ce te pot ajuta astăzi?',
        'bună': 'Bună ziua! 🤖 Sunt chatbot-ul tău român.',
        'ce faci': 'Sunt aici să vorbesc cu tine! Totul e bine la mine.',
        'cum ești': 'Sunt excelent, mulțumesc! 😄 Sunt un chatbot român creat special pentru tine.',
        'ce poți face': 'Pot să vorbesc cu tine în română, să răspund la întrebări și să te ajut cu informații!',
        'ai': 'Da! Folosesc tehnologii AI pentru a înțelege și genera răspunsuri în română.',
        'mulțumesc': 'Cu plăcere! 🎉 Mereu sunt aici pentru tine.',
        'la revedere': 'La revedere! 👋 A fost plăcerea mea să vorbim!'
    };

    // Caută cel mai bun răspuns
    for (const [key, response] of Object.entries(responses)) {
        if (lowerPrompt.includes(key)) {
            return response;
        }
    }

    // Răspuns default inteligent
    return `Interesantă întrebare: "${prompt}"! 🤔 Ca chatbot român, încerc să învăț din fiecare conversație. Poți să-mi explici mai multe?`;
}

// Ruta principală de chat
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim().length === 0) {
            return res.json({ 
                reply: '👋 Te rog scrie un mesaj ca să putem conversa!',
                type: 'error'
            });
        }

        console.log('📨 Mesaj primit:', message);
        const aiResponse = await queryHuggingFace(message);
        console.log('🤖 Răspuns generat:', aiResponse);

        res.json({ 
            reply: aiResponse,
            type: 'success',
            timestamp: new Date().toLocaleString('ro-RO')
        });

    } catch (error) {
        console.error('❌ Eroare server:', error);
        res.status(500).json({ 
            reply: '⚠️ Scuze, am o problemă temporară. Încearcă din nou!',
            type: 'error'
        });
    }
});

// Pagina principală frumoasă
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Chatbot Român AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .chat-app {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 500px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        .chat-container {
            padding: 20px;
            max-height: 400px;
            overflow-y: auto;
        }
        .message {
            margin: 15px 0;
            padding: 15px;
            border-radius: 15px;
            max-width: 80%;
            animation: fadeIn 0.3s ease-in;
        }
        .user-message {
            background: #e3f2fd;
            margin-left: auto;
            border-bottom-right-radius: 5px;
        }
        .bot-message {
            background: #f5f5f5;
            margin-right: auto;
            border-bottom-left-radius: 5px;
        }
        .input-container {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        #messageInput {
            flex: 1;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }
        #messageInput:focus {
            border-color: #4CAF50;
        }
        #sendButton {
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            font-size: 20px;
            transition: transform 0.2s;
        }
        #sendButton:hover {
            transform: scale(1.1);
            background: #45a049;
        }
        .typing {
            color: #666;
            font-style: italic;
            padding: 10px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="chat-app">
        <div class="header">
            <h1>🤖 Chatbot Român</h1>
            <p>AI conversațional în limba română</p>
        </div>
        
        <div class="chat-container" id="chatContainer">
            <div class="message bot-message">
                👋 Salut! Sunt chatbot-ul tău român. Cu ce te pot ajuta astăzi?
            </div>
        </div>
        
        <div class="input-container">
            <input type="text" id="messageInput" placeholder="Scrie mesajul tău aici..." autocomplete="off">
            <button id="sendButton">➤</button>
        </div>
    </div>

    <script>
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(text, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = text;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function showTyping() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing';
            typingDiv.id = 'typingIndicator';
            typingDiv.textContent = 'Bot-ul scrie...';
            chatContainer.appendChild(typingDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function hideTyping() {
            const typing = document.getElementById('typingIndicator');
            if (typing) typing.remove();
        }

        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            // Adaugă mesajul utilizatorului
            addMessage(message, true);
            messageInput.value = '';
            
            // Arată că bot-ul scrie
            showTyping();

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });
                
                const data = await response.json();
                hideTyping();
                addMessage(data.reply);

            } catch (error) {
                hideTyping();
                addMessage('❌ Eroare de conexiune. Încearcă din nou.');
            }
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Focus pe input la încărcare
        messageInput.focus();
    </script>
</body>
</html>
    `);
});

// Pornire server
app.listen(PORT, () => {
    console.log(`🚀 Serverul rulează pe portul ${PORT}`);
    console.log(`🌐 Accesează: http://localhost:${PORT}`);
    console.log(`🤖 Chatbot-ul român este gata!`);
    if (!HF_TOKEN) {
        console.log(`ℹ️  Folosim modul simulare - setează HF_TOKEN pentru AI real`);
    }
});
