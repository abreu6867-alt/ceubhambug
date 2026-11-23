/* ==========================================================================
   BURG'R CLUB — script.js
   Organização:
   1. Dados placeholder do cardápio (protótipo)
   2. Renderização dos cards de produto
   3. Menu mobile
   4. Scroll reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupMobileMenu();
  setupScrollReveal();
  setupHeaderShadow();
});

/* --------------------------------------------------------------------------
   1. DADOS PLACEHOLDER
   IMPORTANTE: estes itens NÃO são o cardápio oficial da Burg'r Club.
   São dados temporários de protótipo (isPlaceholder: true) e devem ser
   substituídos pelo cardápio real antes da publicação do site.
   -------------------------------------------------------------------------- */
const PRODUCTS = [
  {
    "category": "Artesanais",
    "name": "Club Clássico",
    "price": 20,
    "description": "Pão brioche, blend de 120g, cheddar e molho especial.",
    "image": "burger"
  },
  {
    "category": "Artesanais",
    "name": "Club Salada",
    "price": 22,
    "description": "Pão brioche, blend de 120g, cheddar, salada e molho especial.",
    "image": "burger"
  },
  {
    "category": "Artesanais",
    "name": "Club Bacon",
    "price": 24,
    "description": "Pão brioche, blend de 120g, cheddar, bacon e molho especial.",
    "image": "burger"
  },
  {
    "category": "Artesanais",
    "name": "Club Coalho",
    "price": 32,
    "description": "Pão brioche, blend de 120g, queijo coalho, melado de cana, bacon e molho especial.",
    "image": "burger"
  },
  {
    "category": "Artesanais",
    "name": "Burg’r Club",
    "price": 34,
    "description": "Pão brioche, 2 blends de 120g, duplo cheddar, duplo bacon e molho especial.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Salada",
    "price": 10,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Bomba",
    "price": 13,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Egg",
    "price": 13,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Calabresa",
    "price": 13,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Bacon",
    "price": 13,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Moda da Casa",
    "price": 16,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Tudo",
    "price": 20,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Especial",
    "price": 16,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Tradicionais",
    "name": "Burg’r Club",
    "price": 26,
    "description": "Hambúrguer tradicional. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Salada (filé mignon)",
    "price": 16,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Bomba (filé mignon)",
    "price": 19,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Egg (filé mignon)",
    "price": 19,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Calabresa (filé mignon)",
    "price": 19,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Bacon (filé mignon)",
    "price": 19,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Moda da Casa (filé mignon)",
    "price": 22,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Tudo (filé mignon)",
    "price": 24,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Especial (filé mignon)",
    "price": 23,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Filé mignon",
    "name": "Burg’r Club (filé mignon)",
    "price": 34,
    "description": "Hambúrguer com filé mignon. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Salada (frango)",
    "price": 15,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Bomba (frango)",
    "price": 17,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Egg (frango)",
    "price": 17,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Calabresa (frango)",
    "price": 17,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Bacon (frango)",
    "price": 17,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Moda da Casa (frango)",
    "price": 20,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Tudo (frango)",
    "price": 22,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Especial (frango)",
    "price": 23,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Frango",
    "name": "Burg’r Club (frango)",
    "price": 32,
    "description": "Opção com frango. Consulte os ingredientes no atendimento.",
    "image": "burger"
  },
  {
    "category": "Cachorro-quente",
    "name": "Dog na chapa",
    "price": 15,
    "description": "",
    "image": "hotdog"
  },
  {
    "category": "Cachorro-quente",
    "name": "Dog na chapa duplo",
    "price": 17,
    "description": "",
    "image": "hotdog"
  },
  {
    "category": "Cachorro-quente",
    "name": "Dog de frango catupiry",
    "price": 17,
    "description": "",
    "image": "hotdog"
  },
  {
    "category": "Cachorro-quente",
    "name": "Dog de frango cheddar",
    "price": 19,
    "description": "",
    "image": "hotdog"
  },
  {
    "category": "Especiais",
    "name": "Burg’r Vegetariano",
    "price": 15,
    "description": "",
    "image": "burger"
  },
  {
    "category": "Especiais",
    "name": "Burg’r Kids",
    "price": 18,
    "description": "",
    "image": "burger"
  },
  {
    "category": "Trios",
    "name": "Trio Burg’r Salada",
    "price": 18,
    "description": "Hambúrguer, batata frita e refrigerante conforme cardápio.",
    "image": "combo"
  },
  {
    "category": "Trios",
    "name": "Trio Burg’r Bomba",
    "price": 20,
    "description": "Hambúrguer, batata frita e refrigerante conforme cardápio.",
    "image": "combo"
  },
  {
    "category": "Trios",
    "name": "Trio Burg’r Egg",
    "price": 20,
    "description": "Hambúrguer, batata frita e refrigerante conforme cardápio.",
    "image": "combo"
  },
  {
    "category": "Trios",
    "name": "Trio Burg’r Calabresa",
    "price": 20,
    "description": "Hambúrguer, batata frita e refrigerante conforme cardápio.",
    "image": "combo"
  },
  {
    "category": "Trios",
    "name": "Trio Burg’r Bacon",
    "price": 20,
    "description": "Hambúrguer, batata frita e refrigerante conforme cardápio.",
    "image": "combo"
  },
  {
    "category": "Batatas",
    "name": "Batata frita pequena",
    "price": 10,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Batatas",
    "name": "Batata frita média",
    "price": 20,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Batatas",
    "name": "Batata frita grande",
    "price": 25,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Batatas",
    "name": "Batata com bacon e cheddar",
    "price": 30,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Adicionais",
    "name": "Hambúrguer extra",
    "price": 3,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Adicionais",
    "name": "Bacon extra",
    "price": 5,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Adicionais",
    "name": "Salsicha extra",
    "price": 3,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Adicionais",
    "name": "Ovo extra",
    "price": 3,
    "description": "",
    "image": "fries"
  },
  {
    "category": "Bebidas",
    "name": "Refrigerante lata 310ml",
    "price": 6,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Refrigerante 600ml",
    "price": 8,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Refrigerante 2L",
    "price": 15,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Água mineral",
    "price": 3.5,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Água com gás",
    "price": 4.5,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Suco polpa 350ml",
    "price": 8,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Creme 350ml",
    "price": 10,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Jarra de suco 1,2L",
    "price": 22,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Jarra de creme 1,2L",
    "price": 25,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Milk-shake 300ml",
    "price": 16,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Milk-shake 500ml",
    "price": 19,
    "description": "",
    "image": "drink"
  },
  {
    "category": "Bebidas",
    "name": "Soda italiana 300ml",
    "price": 10,
    "description": "",
    "image": "drink"
  }
];
const MENU_IMAGES = {"burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80", "combo": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80", "fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80", "drink": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=80", "hotdog": "https://images.unsplash.com/photo-1612392062798-2c3c59a04f0c?auto=format&fit=crop&w=700&q=80"};
let currentCategory = "Todos";

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const filters = document.getElementById("menu-filters");
  if (!grid || !filters) return;
  const categories = ["Todos", ...new Set(PRODUCTS.map(p => p.category))];
  filters.innerHTML = categories.map(cat => `<button type="button" class="menu-filter ${cat === currentCategory ? "active" : ""}" data-category="${cat}" aria-pressed="${cat === currentCategory}">${cat}</button>`).join("");
  filters.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { currentCategory = btn.dataset.category; renderProducts(); }));
  const selected = currentCategory === "Todos" ? PRODUCTS : PRODUCTS.filter(p => p.category === currentCategory);
  grid.innerHTML = selected.map(p => {
    const message = encodeURIComponent(`Olá! Gostaria de pedir ${p.name} (${formatPrice(p.price)}). Poderiam confirmar a disponibilidade?`);
    return `<article class="product-card"><div class="product-card__photo"><img src="${MENU_IMAGES[p.image]}" alt="Imagem ilustrativa de ${p.category}" loading="lazy"><span class="product-card__badge">${p.category}</span></div><div class="product-card__body"><h3>${p.name}</h3><p>${p.description || "Consulte os detalhes e a disponibilidade pelo WhatsApp."}</p><div class="product-card__footer"><span class="product-card__price">${formatPrice(p.price)}</span><a href="https://wa.me/5561998145130?text=${message}" target="_blank" rel="noopener" class="btn btn--outline product-card__cta">Pedir</a></div></div></article>`;
  }).join("");
}
function formatPrice(value) { return new Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"}).format(value); }

/* --------------------------------------------------------------------------
   3. MENU MOBILE
   -------------------------------------------------------------------------- */
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

/* --------------------------------------------------------------------------
   4. SCROLL REVEAL (animação de entrada leve, respeita prefers-reduced-motion)
   -------------------------------------------------------------------------- */
function setupScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. SOMBRA NO HEADER AO ROLAR
   -------------------------------------------------------------------------- */
function setupHeaderShadow() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 12) {
      header.style.boxShadow = '0 12px 24px -18px rgba(0,0,0,0.6)';
    } else {
      header.style.boxShadow = 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
