const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Load products
const PRODUCTS_PATH = path.join(__dirname, 'data', 'products.json');
function loadProducts() {
  const raw = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
  return JSON.parse(raw);
}

// API: list products
app.get('/api/products', (req, res) => {
  try {
    const products = loadProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to load products' });
  }
});

// API: chatbot proxy to OpenAI
app.post('/api/chat', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
  }

  try {
    const { message, history = [], productId } = req.body;

    if (!message) return res.status(400).json({ error: 'message required' });

    // Build messages for OpenAI, include product context if provided
    const system = {
      role: 'system',
      content:
        'Você é um assistente de loja online especializado em produtos de festa e carnaval. Seja útil, curto e dê sugestões de produtos, tamanhos, cores, usos e sugestões de combinação. Forneça respostas objetivas e, quando apropriado, sugira produtos do catálogo.',
    };

    const productContext = productId
      ? (() => {
          try {
            const products = loadProducts();
            const p = products.find((x) => x.id === productId);
            if (!p) return null;
            return {
              role: 'system',
              content: `Contexto do produto: id=${p.id}, nome="${p.name}", preço=${p.price}, descrição="${p.description}".`,
            };
          } catch {
            return null;
          }
        })()
      : null;

    const messages = [system];
    if (productContext) messages.push(productContext);
    history.slice(-6).forEach((m) => {
      messages.push({ role: m.role, content: m.content });
    });
    messages.push({ role: 'user', content: message });

    const payload = {
      model: OPENAI_MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.7,
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('OpenAI error', resp.status, txt);
      return res.status(resp.status).send(txt);
    }

    const data = await resp.json();
    const assistantMessage = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';

    res.json({ reply: assistantMessage, raw: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// API: fake checkout endpoint (simula)
app.post('/api/checkout', (req, res) => {
  try {
    const { cart = [], customer = {} } = req.body;
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'cart empty' });
    }
    const orderId = 'ORD-' + Date.now();
    res.json({ success: true, orderId, message: 'Pedido recebido! (simulado)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'checkout failed' });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});