// shop.js - carrega produtos, gerencia carrinho e checkout (simulado)
const productsEl = document.getElementById('products');
const cartCountEl = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const openCartBtn = document.getElementById('open-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

let products = [];
let cart = []; // {id, qty}

function formatPrice(n) {
  return n.toFixed(2).replace('.', ',');
}

async function loadProducts() {
  const resp = await fetch('/api/products');
  products = await resp.json();
  renderProducts();
}

function renderProducts() {
  productsEl.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>${p.description}</p>
      <div class="meta">
        <div class="price">R$ ${formatPrice(p.price)}</div>
        <div class="actions">
          <button class="btn" data-id="${p.id}" onclick="addToCart('${p.id}')">Adicionar</button>
          <button class="btn" onclick="openChatForProduct('${p.id}')">Ver / Chat</button>
        </div>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

window.addToCart = function (productId) {
  const item = cart.find(c => c.id === productId);
  if (item) item.qty++;
  else cart.push({ id: productId, qty: 1 });
  updateCartUI();
};

function updateCartUI() {
  const totalQty = cart.reduce((s, c) => s + c.qty, 0);
  cartCountEl.innerText = totalQty;
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(ci => {
    const p = products.find(x => x.id === ci.id);
    if (!p) return;
    const line = document.createElement('div');
    line.style.display = 'flex';
    line.style.justifyContent = 'space-between';
    line.style.marginBottom = '0.6rem';
    line.innerHTML = `<div>${p.name} x ${ci.qty}</div><div>R$ ${formatPrice(p.price * ci.qty)}</div>`;
    cartItemsEl.appendChild(line);
    total += p.price * ci.qty;
  });
  cartTotalEl.innerText = formatPrice(total);
}

openCartBtn.addEventListener('click', () => cartModal.classList.remove('hidden'));
closeCartBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

checkoutBtn.addEventListener('click', async () => {
  if (cart.length === 0) return alert('Carrinho vazio');
  const resp = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart, customer: { name: 'Cliente Exemplo' } })
  });
  const data = await resp.json();
  if (data.success) {
    alert(`Compra simulada: ${data.orderId}\nMensagem: ${data.message}`);
    cart = [];
    updateCartUI();
    cartModal.classList.add('hidden');
  } else {
    alert('Erro no checkout (simulação).');
  }
});

window.openChatForProduct = function (productId) {
  const evt = new CustomEvent('chat-open-for-product', { detail: { productId } });
  window.dispatchEvent(evt);
  document.getElementById('chat-toggle').click();
};

// init
loadProducts();
updateCartUI();