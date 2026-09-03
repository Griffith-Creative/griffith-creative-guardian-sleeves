// Global cart UI: drawer open/close, live rendering, line editing, checkout.
// Data lives in lib/cart.js; this file only touches the DOM.
import { onCartChange, getCurrent, loadCart, setLineQuantity, removeLine } from '../lib/cart.js';

function money(amount, currency) {
  const n = Number(amount);
  if (Number.isNaN(n)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

const root = () => document.getElementById('cart-root');
const OUTSIDE = 'main, footer, nav, a[href="#main-content"]';
let lastTrigger = null;

function openCart() {
  const r = root();
  if (!r) return;
  lastTrigger = document.activeElement;
  r.classList.add('is-open');
  r.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Keep Tab inside the drawer: everything outside it goes inert while open.
  document.querySelectorAll(OUTSIDE).forEach((el) => el.setAttribute('inert', ''));
  document.getElementById('cart-close')?.focus();
}

function closeCart() {
  const r = root();
  if (!r) return;
  r.classList.remove('is-open');
  r.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.querySelectorAll(OUTSIDE).forEach((el) => el.removeAttribute('inert'));
  // Put focus back where the visitor was, not on a hidden close button.
  if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  lastTrigger = null;
}

function lineHTML(line) {
  const m = line.merchandise || {};
  const title = m.product?.title || m.title || 'Item';
  const price = money(m.price?.amount, m.price?.currencyCode);
  const img = m.image?.url
    ? `<img src="${m.image.url}" alt="" class="w-16 h-16 object-cover bg-soft-cloud rounded-[12px] shrink-0" />`
    : `<div class="w-16 h-16 bg-soft-cloud rounded-[12px] shrink-0"></div>`;
  return `
    <div class="flex gap-4 py-4 border-b border-hairline" data-line-id="${line.id}">
      ${img}
      <div class="flex-1 min-w-0">
        <p class="text-[14px] font-medium text-ink truncate">${title}</p>
        <p class="text-[13px] text-mute mt-0.5">${price}</p>
        <div class="flex items-center justify-between mt-2">
          <div class="inline-flex items-center border border-hairline rounded-full">
            <button type="button" data-line-dec aria-label="Decrease quantity" class="w-8 h-8 flex items-center justify-center text-[18px] text-ink hover:bg-soft-cloud rounded-l-full transition-colors">&minus;</button>
            <span class="w-8 text-center text-[14px] font-medium text-ink">${line.quantity}</span>
            <button type="button" data-line-inc aria-label="Increase quantity" class="w-8 h-8 flex items-center justify-center text-[18px] text-ink hover:bg-soft-cloud rounded-r-full transition-colors">+</button>
          </div>
          <button type="button" data-line-remove class="text-[13px] text-mute hover:text-[color:var(--warning)] underline transition-colors">Remove</button>
        </div>
      </div>
    </div>`;
}

function render(cart) {
  const count = cart?.totalQuantity || 0;

  // Nav badges (there may be more than one place a badge lives)
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('hidden', count === 0);
  });

  const linesEl = document.getElementById('cart-lines');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');
  if (!linesEl || !emptyEl || !footerEl) return;

  const lines = cart?.lines?.nodes || [];
  if (!lines.length) {
    linesEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  linesEl.classList.remove('hidden');
  footerEl.classList.remove('hidden');
  linesEl.innerHTML = lines.map(lineHTML).join('');

  const sub = document.getElementById('cart-subtotal');
  if (sub) sub.textContent = money(cart.cost?.subtotalAmount?.amount, cart.cost?.subtotalAmount?.currencyCode);
}

function setBusy(busy) {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.style.opacity = busy ? '0.6' : '';
  if (drawer) drawer.style.pointerEvents = busy ? 'none' : '';
}

async function guard(promise) {
  setBusy(true);
  try { await promise; }
  catch (err) {
    const s = document.getElementById('cart-status');
    if (s) { s.textContent = 'Something went wrong. Please try again.'; s.classList.remove('hidden'); s.style.color = 'var(--warning)'; }
    console.error('Cart error:', err);
  } finally { setBusy(false); }
}

function onClick(e) {
  const openBtn = e.target.closest('[data-open-cart]');
  if (openBtn) { e.preventDefault(); openCart(); return; }

  if (e.target.closest('#cart-close') || e.target.closest('[data-cart-close]') || e.target.id === 'cart-backdrop') {
    closeCart();
    return;
  }

  const lineEl = e.target.closest('[data-line-id]');
  if (lineEl) {
    const id = lineEl.dataset.lineId;
    const qty = parseInt(lineEl.querySelector('.w-8.text-center')?.textContent || '1', 10) || 1;
    if (e.target.closest('[data-line-inc]')) { guard(setLineQuantity(id, qty + 1)); return; }
    if (e.target.closest('[data-line-dec]')) { guard(setLineQuantity(id, qty - 1)); return; }
    if (e.target.closest('[data-line-remove]')) { guard(removeLine(id)); return; }
  }

  const checkout = e.target.closest('#cart-checkout');
  if (checkout) {
    const cart = getCurrent();
    if (cart?.checkoutUrl) {
      checkout.disabled = true;
      checkout.textContent = 'Loading…';
      window.location.href = cart.checkoutUrl;
    }
    return;
  }
}

// Bind global listeners once.
if (!window.__cartUIBound) {
  window.__cartUIBound = true;
  onCartChange(render);
  document.addEventListener('click', onClick);
  document.addEventListener('cart:open', openCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
  loadCart();
}

// Nav (with its badge) is re-rendered on view transitions - repaint from cache.
document.addEventListener('astro:after-swap', () => render(getCurrent()));
