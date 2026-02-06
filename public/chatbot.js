// chatbot.js - interface simples para /api/chat
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatMessages = document.getElementById('chat-messages');
const chatInputField = document.getElementById('chat-input-field');
const chatSend = document.getElementById('chat-send');

let chatHistory = []; // {role, content}
let currentProductId = null;

chatToggle.addEventListener('click', () => {
  chatWindow.classList.toggle('hidden');
  chatToggle.classList.toggle('active');
});
chatClose.addEventListener('click', () => {
  chatWindow.classList.add('hidden');
});

chatSend.addEventListener('click', sendMessage);
chatInputField.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

window.addEventListener('chat-open-for-product', (e) => {
  currentProductId = e.detail.productId;
  appendMessage('bot', 'Estou vendo esse produto. Pergunte o que quiser sobre ele.');
});

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
  div.innerText = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const text = chatInputField.value.trim();
  if (!text) return;
  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });
  chatInputField.value = '';
  appendMessage('bot', '…'); // placeholder
  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory,
        productId: currentProductId
      })
    });
    const data = await resp.json();
    const last = chatMessages.lastChild;
    if (last && last.innerText === '…') last.remove();
    const reply = data.reply || 'Desculpe, sem resposta.';
    appendMessage('bot', reply);
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    console.error(err);
    appendMessage('bot', 'Erro ao conectar ao servidor.');
  }
}

// greeting
appendMessage('bot', 'Olá! Posso te ajudar a achar produtos ou tirar dúvidas sobre materiais e combinações.');