/* ==========================================================================
   BURG'R CLUB — Painel Administrativo — admin.js
   Sem backend: pedidos e estoque são salvos no localStorage do navegador.

   Organização:
   1. Chaves de armazenamento e dados de exemplo (seed)
   2. Funções de leitura/escrita no localStorage
   3. Navegação entre views (Dashboard / Pedidos / Estoque)
   4. Renderização do Dashboard (cards + avisos)
   5. Renderização e ações de Pedidos
   6. Renderização e ações de Estoque
   7. Modais (abrir/fechar/salvar)
   8. Inicialização
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CHAVES DE ARMAZENAMENTO E DADOS DE EXEMPLO
   -------------------------------------------------------------------------- */
   // ===============================
// CONEXÃO COM O SUPABASE
// ===============================

const SUPABASE_URL = 'https://umwkensyurcdbijmsfpg.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_XcbKuIvTpYMLWfLQ2BD6ZA_c9TnLcDX';

const supabaseClient = window.supabase?.createClient ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;
function notifyError(action, error) { console.error(action, error); alert(`${action}: ${error?.message || error || 'Falha desconhecida'}. Confira as permissões RLS e a conexão com Supabase.`); }
function requireDb() { if (!supabaseClient) { alert('Supabase indisponível. Verifique a conexão com a internet e recarregue a página.'); return false; } return true; }
const STORAGE_KEYS = {
  ORDERS: 'burgrclub_orders',
  STOCK: 'burgrclub_stock',
  STAFF: 'burgrclub_staff'
};

// Dados de exemplo usados apenas na primeira vez que o painel é aberto
// (quando ainda não existe nada salvo no localStorage). Marcados como seed
// para deixar claro que não são pedidos/estoque reais.
const SEED_ORDERS = [
  {
    id: 'PED-1001',
    cliente: 'João Silva',
    itens: "2x Burg'r Bacon, 1x Batata Frita",
    valor: 62.70,
    horario: '12:35',
    status: 'novo'
  },
  {
    id: 'PED-1002',
    cliente: 'Marina Costa',
    itens: "1x Burg'r Classic, 1x Milk-shake",
    valor: 39.80,
    horario: '12:41',
    status: 'preparo'
  },
  {
    id: 'PED-1003',
    cliente: 'Pedro Almeida',
    itens: "1x Combo Burg'r",
    valor: 36.90,
    horario: '11:58',
    status: 'finalizado'
  }
];

const SEED_STOCK = [
  { id: 'ITEM-1', nome: 'Pão brioche', categoria: 'Pães', quantidade: 40, minimo: 20, unidade: 'un' },
  { id: 'ITEM-2', nome: 'Blend artesanal 150g', categoria: 'Carnes', quantidade: 15, minimo: 20, unidade: 'un' },
  { id: 'ITEM-3', nome: 'Queijo cheddar', categoria: 'Laticínios', quantidade: 3, minimo: 5, unidade: 'kg' },
  { id: 'ITEM-4', nome: 'Batata pré-frita', categoria: 'Congelados', quantidade: 25, minimo: 10, unidade: 'kg' }
];

/* --------------------------------------------------------------------------
   2. LEITURA / ESCRITA NO LOCALSTORAGE
   -------------------------------------------------------------------------- */
function getOrders() {
  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!raw) {
    saveOrders([]);
    return [];
  }
  try { return JSON.parse(raw); } catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function getStock() {
  const raw = localStorage.getItem(STORAGE_KEYS.STOCK);
  if (!raw) {
    saveStock([]);
    return [];
  }
  try { return JSON.parse(raw); } catch { return []; }
}

function saveStock(stock) {
  localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
}

/* --------------------------------------------------------------------------
   3. NAVEGAÇÃO ENTRE VIEWS
   -------------------------------------------------------------------------- */
const PAGE_TITLES = {
  dashboard: 'Tela Inicial',
  pedidos: 'Pedidos',
  estoque: 'Estoque'
};

function setupNavigation() {
  const links = document.querySelectorAll('.sidebar__link');
  const views = document.querySelectorAll('.view');
  const pageTitle = document.getElementById('pageTitle');
  const sidebar = document.getElementById('sidebar');

  links.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.view;

      links.forEach(l => l.classList.toggle('is-active', l === link));
      views.forEach(v => v.classList.toggle('is-active', v.id === `view-${target}`));
      pageTitle.textContent = PAGE_TITLES[target] || 'Painel';

      // Fecha o menu no mobile após navegar
      sidebar.classList.remove('is-open');

      if (target === 'dashboard') renderDashboard();
      if (target === 'pedidos') renderPedidos();
      if (target === 'estoque') renderEstoque();
    });
  });

  // Menu hambúrguer (mobile)
  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => sidebar.classList.toggle('is-open'));
}

/* --------------------------------------------------------------------------
   4. DASHBOARD (cards dinâmicos + avisos automáticos)
   -------------------------------------------------------------------------- */
function isToday(order) {
  // Como os pedidos de exemplo não têm data completa, consideramos que
  // qualquer pedido salvo é "de hoje" neste protótipo sem backend.
  // Ao integrar com um sistema real, comparar order.data com a data atual.
  return true;
}

function renderDashboard() {
  const orders = getOrders();
  const stock = getStock();

  const pedidosHoje = orders.filter(isToday).length;
  const emPreparo = orders.filter(o => o.status === 'preparo').length;
  const faturamento = orders
    .filter(o => o.status === 'finalizado')
    .reduce((total, o) => total + Number(o.valor || 0), 0);
  const itensEstoqueBaixo = stock.filter(i => stockLevel(i) !== "green");
  const criticos = stock.filter(i => stockLevel(i) === "red");
  const priority = document.getElementById("priorityAlert");
  priority.classList.toggle("is-visible", criticos.length > 0);
  priority.textContent = criticos.length ? `🔴 PRIORIDADE: ${criticos.length} produto(s) em nível crítico: ${criticos.map(i => i.nome).join(", ")}. Reponha primeiro!` : "";

  document.getElementById('statPedidosHoje').textContent = pedidosHoje;
  document.getElementById('statEmPreparo').textContent = emPreparo;
  document.getElementById('statFaturamento').textContent = formatMoney(faturamento);
  document.getElementById('statEstoqueBaixo').textContent = itensEstoqueBaixo.length;

  renderAvisos(orders, itensEstoqueBaixo);
}

function renderAvisos(orders, itensEstoqueBaixo) {
  const list = document.getElementById('avisosList');
  const avisos = [];

  // Aviso de estoque baixo (um por item)
  itensEstoqueBaixo.forEach(item => {
    avisos.push({
      tipo: 'danger',
      texto: `Estoque baixo: "${item.nome}" está com ${item.quantidade} ${item.unidade} (mínimo: ${item.minimo} ${item.unidade}).`
    });
  });

  // Aviso de pedidos novos aguardando preparo
  const novos = orders.filter(o => o.status === 'novo').length;
  if (novos > 0) {
    avisos.push({
      tipo: 'info',
      texto: `${novos} pedido(s) novo(s) aguardando início do preparo.`
    });
  }

  // Aviso de pedidos prontos aguardando entrega/retirada
  const prontos = orders.filter(o => o.status === 'pronto').length;
  if (prontos > 0) {
    avisos.push({
      tipo: 'info',
      texto: `${prontos} pedido(s) pronto(s) aguardando finalização.`
    });
  }

  if (avisos.length === 0) {
    list.innerHTML = '<li class="avisos-list__empty">Nenhum aviso no momento. Tudo em dia! ✅</li>';
    return;
  }

  list.innerHTML = avisos.map(a => `
    <li class="aviso-item aviso-item--${a.tipo}">${a.texto}</li>
  `).join('');
}

function formatMoney(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* --------------------------------------------------------------------------
   5. PEDIDOS
   -------------------------------------------------------------------------- */
const STATUS_LABELS = {
  novo: 'Novo',
  preparo: 'Em preparo',
  pronto: 'Pronto',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado'
};

// Define qual é o próximo status possível a partir do atual
const NEXT_STATUS = {
  novo: 'preparo',
  preparo: 'pronto',
  pronto: 'finalizado'
};

function renderPedidos() {
  const orders = getOrders();
  const tbody = document.getElementById('pedidosTableBody');
  const empty = document.getElementById('pedidosEmpty');

  empty.classList.toggle('is-visible', orders.length === 0);

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${escapeHtml(order.cliente)}</td>
      <td>${escapeHtml(order.itens)}</td>
      <td>${formatMoney(Number(order.valor))}</td>
      <td>${order.horario}</td>
      <td><span class="status-badge status-badge--${order.status}">${STATUS_LABELS[order.status]}</span></td>
      <td>
        <div class="status-actions">
          ${renderStatusButtons(order)}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStatusButtons(order) {
  const buttons = [];

  const next = NEXT_STATUS[order.status];
  if (next) {
    buttons.push(`<button class="status-btn" data-action="advance" data-id="${order.id}">Marcar como ${STATUS_LABELS[next]}</button>`);
  }

  if (order.status !== 'cancelado' && order.status !== 'finalizado') {
    buttons.push(`<button class="status-btn status-btn--danger" data-action="cancel" data-id="${order.id}">Cancelar</button>`);
  }

  return buttons.join('');
}

// Preços do cardápio público. Itens sem preço confirmado não são oferecidos aqui.
const CARDAPIO = [
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
function setupPedidoCalculadora() {
  const lista = document.getElementById('pedidoProdutos');
  const linhas = document.getElementById('pedidoLinhas');
  const total = document.getElementById('pedidoTotalCalculado');
  const disponiveis = CARDAPIO.filter(p => Number.isFinite(Number(p.price)) && Number(p.price) > 0);
  lista.innerHTML = '<option value="">Escolha um produto</option>' + disponiveis.map((p,i) => `<option value="${i}">${escapeHtml(p.name)} • ${formatMoney(p.price)}</option>`).join('');
  let itens = [];
  const atualizar = () => {
    linhas.innerHTML = itens.map((x,i) => `<div class="pedido-linha"><span>${escapeHtml(x.nome)} × ${x.qtd}</span><strong>${formatMoney(x.preco*x.qtd)}</strong><button type="button" class="btn btn--ghost" data-remove="${i}" aria-label="Remover item">✕</button></div>`).join('');
    const centavos = itens.reduce((sum,x)=>sum+Math.round(x.preco*100)*x.qtd,0);
    document.getElementById('pedidoValor').value = (centavos/100).toFixed(2);
    document.getElementById('pedidoItens').value = itens.map(x=>`${x.qtd}x ${x.nome}`).join(', ');
    total.textContent = formatMoney(centavos/100);
  };
  document.getElementById('btnAdicionarProduto').addEventListener('click',()=>{
    const idx=Number(lista.value), qtd=Number(document.getElementById('pedidoQuantidade').value);
    if(lista.value==='' || !Number.isInteger(qtd) || qtd<1 || qtd>999) return alert('Selecione o produto e informe uma quantidade válida.');
    const p=disponiveis[idx]; if(!p) return;
    const found=itens.find(x=>x.nome===p.name && x.preco===Number(p.price));
    if(found) found.qtd+=qtd; else itens.push({nome:p.name,preco:Number(p.price),qtd});
    atualizar();
  });
  linhas.addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;itens.splice(Number(b.dataset.remove),1);atualizar();});
  return ()=>{itens=[];lista.value='';document.getElementById('pedidoQuantidade').value=1;atualizar();};
}
function setupPedidosActions() {
  const resetItens=setupPedidoCalculadora();
  document.getElementById('pedidosTableBody').addEventListener('click',e=>{
    const btn=e.target.closest('button[data-action]'); if(!btn)return;
    const orders=getOrders(), order=orders.find(o=>o.id===btn.dataset.id);if(!order)return;
    if(btn.dataset.action==='advance') order.status=NEXT_STATUS[order.status]||order.status;
    if(btn.dataset.action==='cancel' && confirm('Cancelar este pedido?'))order.status='cancelado';
    saveOrders(orders);renderPedidos();renderDashboard();
  });
  document.getElementById('btnNovoPedido').addEventListener('click',()=>{
    document.getElementById('formPedido').reset();resetItens();
    document.getElementById('modalPedidoTitle').textContent='Novo pedido';openModal('modalPedido');
  });
  document.getElementById('formPedido').addEventListener('submit',e=>{
    e.preventDefault();
    const cliente=document.getElementById('pedidoCliente').value.trim();
    const itens=document.getElementById('pedidoItens').value;
    const valor=Number(document.getElementById('pedidoValor').value);
    if(!cliente||!itens||!Number.isFinite(valor)||valor<=0) return alert('Informe o cliente e adicione pelo menos um produto.');
    const orders=getOrders();orders.unshift({id:generateOrderId(orders),cliente,itens,valor,horario:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),status:'novo',created_at:new Date().toISOString()});
    try {saveOrders(orders);closeModal('modalPedido');renderPedidos();renderDashboard();}
    catch(err){notifyError('Falha ao salvar pedido neste navegador',err);}
  });
}

function generateOrderId(orders) {
  const numbers = orders
    .map(o => parseInt(o.id.replace('PED-', ''), 10))
    .filter(n => !isNaN(n));
  const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1001;
  return `PED-${nextNumber}`;
}

/* --------------------------------------------------------------------------
   6. ESTOQUE
   -------------------------------------------------------------------------- */
function stockLevel(item) {
  const q = Number(item.quantidade);
  const min = Number(item.minimo);
  if (q <= 3) return 'red';
  if (q <= min) return 'yellow';
  return 'green';
}
function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function getStaff() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF) || '[]'); } catch { return []; } }
function saveStaff(v) { localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(v)); }
function renderStaff() {
  const staff = getStaff();
  document.getElementById('funcionariosEmpty').classList.toggle('is-visible', staff.length === 0);
  document.getElementById('funcionariosTableBody').innerHTML = staff.map(p => `<tr><td>${escapeHtml(p.nome)}</td><td>${escapeHtml(p.cargo)}</td><td>${escapeHtml(p.telefone || '—')}</td><td>${escapeHtml(p.tipo)}</td><td><div class="row-actions"><button class="icon-btn" data-staff-action="edit" data-id="${p.id}">✎</button><button class="icon-btn icon-btn--danger" data-staff-action="delete" data-id="${p.id}">🗑</button></div></td></tr>`).join('');
}
function setupStaff() {
  const form = document.getElementById('formFuncionario');
  document.getElementById('btnNovoFuncionario').addEventListener('click', () => { form.reset(); document.getElementById('funcionarioId').value=''; document.getElementById('modalFuncionarioTitle').textContent='Cadastrar pessoa'; openModal('modalFuncionario'); });
  document.getElementById('funcionariosTableBody').addEventListener('click', e => {
    const btn = e.target.closest('[data-staff-action]'); if (!btn) return;
    const staff = getStaff(), person = staff.find(p => p.id === btn.dataset.id); if (!person) return;
    if (btn.dataset.staffAction === 'delete') { if (confirm(`Excluir cadastro de ${person.nome}?`)) { saveStaff(staff.filter(p => p.id !== person.id)); renderStaff(); } return; }
    ['Nome','Cargo','Telefone','Tipo'].forEach(k => document.getElementById('funcionario'+k).value = person[k.toLowerCase()] || '');
    document.getElementById('funcionarioId').value = person.id;
    document.getElementById('modalFuncionarioTitle').textContent = 'Editar cadastro'; openModal('modalFuncionario');
  });
  form.addEventListener('submit', e => { e.preventDefault(); const staff=getStaff(), id=document.getElementById('funcionarioId').value; const person={id:id || 'PESSOA-'+Date.now(), nome:document.getElementById('funcionarioNome').value.trim(), cargo:document.getElementById('funcionarioCargo').value.trim(), telefone:document.getElementById('funcionarioTelefone').value.trim(), tipo:document.getElementById('funcionarioTipo').value}; const index=staff.findIndex(p => p.id===id); if(index>=0) staff[index]=person; else staff.push(person); saveStaff(staff); closeModal('modalFuncionario'); renderStaff(); });
}
function renderEstoque() {
  const stock = [...getStock()].sort((a,b) => ({red:0,yellow:1,green:2}[stockLevel(a)] - {red:0,yellow:1,green:2}[stockLevel(b)]));
  const tbody = document.getElementById('estoqueTableBody');
  const empty = document.getElementById('estoqueEmpty');

  empty.classList.toggle('is-visible', stock.length === 0);

  tbody.innerHTML = stock.map(item => {
    const level = stockLevel(item);
    const low = level !== "green";
    return `
      <tr class="stock-row stock-row--${level}">
        <td>${escapeHtml(item.nome)}</td>
        <td>${escapeHtml(item.categoria)}</td>
        <td class="${low ? 'qty-low' : ''}">${item.quantidade}</td>
        <td>${item.minimo}</td>
        <td>${escapeHtml(item.unidade)}</td>
        <td><span class="signal signal--${level}">● ${level === 'red' ? 'Crítico' : level === 'yellow' ? 'Atenção' : 'Suficiente'}</span></td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" data-action="edit" data-id="${item.id}" title="Editar">✎</button>
            <button class="icon-btn icon-btn--danger" data-action="delete" data-id="${item.id}" title="Remover">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupEstoqueActions() {
  const tbody=document.getElementById('estoqueTableBody');
  tbody.addEventListener('click',e=>{
    const btn=e.target.closest('button[data-action]');if(!btn)return;
    const stock=getStock(),item=stock.find(i=>String(i.id)===btn.dataset.id);if(!item)return;
    if(btn.dataset.action==='edit')return openEstoqueModalForEdit(item);
    if(btn.dataset.action==='delete'&&confirm(`Remover "${item.nome}" do estoque?`)){
      saveStock(stock.filter(i=>String(i.id)!==String(item.id)));renderEstoque();renderDashboard();
    }
  });
  document.getElementById('btnNovoItem').addEventListener('click',()=>{
    document.getElementById('formEstoque').reset();document.getElementById('itemId').value='';
    document.getElementById('modalEstoqueTitle').textContent='Novo item de estoque';openModal('modalEstoque');
  });
  document.getElementById('formEstoque').addEventListener('submit',e=>{
    e.preventDefault();const id=document.getElementById('itemId').value;
    const data={nome:document.getElementById('itemNome').value.trim(),categoria:document.getElementById('itemCategoria').value.trim(),quantidade:Number(document.getElementById('itemQuantidade').value),minimo:Number(document.getElementById('itemMinimo').value),unidade:document.getElementById('itemUnidade').value.trim()};
    if(!data.nome||!data.categoria||!data.unidade||!Number.isFinite(data.quantidade)||!Number.isFinite(data.minimo)||data.quantidade<0||data.minimo<0)return alert('Confira os campos do produto.');
    const stock=getStock(),idx=stock.findIndex(i=>String(i.id)===id);
    if(idx>=0)stock[idx]={...stock[idx],...data};else stock.push({id:'ITEM-'+Date.now(),...data});
    try{saveStock(stock);closeModal('modalEstoque');renderEstoque();renderDashboard();}catch(err){notifyError('Falha ao salvar estoque neste navegador',err);}
  });
}

function openEstoqueModalForEdit(item) {
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemNome').value = item.nome;
  document.getElementById('itemCategoria').value = item.categoria;
  document.getElementById('itemQuantidade').value = item.quantidade;
  document.getElementById('itemMinimo').value = item.minimo;
  document.getElementById('itemUnidade').value = item.unidade;
  document.getElementById('modalEstoqueTitle').textContent = 'Editar item de estoque';
  openModal('modalEstoque');
}

/* --------------------------------------------------------------------------
   7. MODAIS
   -------------------------------------------------------------------------- */
function openModal(id) {
  document.getElementById(id).classList.add('is-open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('is-open');
}

function setupModals() {
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => closeModal(el.dataset.closeModal));
  });

  // Fecha ao clicar fora do conteúdo do modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('is-open');
    });
  });
}


async function carregarPedidosSupabase() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('pedidos')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    notifyError('Erro ao carregar pedidos', error);
    return;
  }

  const pedidos = data.map(pedido => ({
    id: `PED-${String(pedido.id).padStart(4, '0')}`,
    cliente: pedido.cliente,
    itens: pedido.itens,
    valor: Number(pedido.valor),
    horario: pedido.horario,
    status: String(pedido.status || 'novo').toLowerCase()
  }));

  localStorage.setItem(
    STORAGE_KEYS.ORDERS,
    JSON.stringify(pedidos)
  );
}

async function carregarEstoqueSupabase() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('estoque')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    notifyError('Erro ao carregar estoque', error);
    return;
  }

  const estoque = data.map(item => ({
    id: item.id,
    nome: item.nome,
    categoria: item.categoria,
    quantidade: Number(item.quantidade),
    minimo: Number(item.minimo),
    unidade: item.unidade
  }));

  localStorage.setItem(
    STORAGE_KEYS.STOCK,
    JSON.stringify(estoque)
  );
}

/* --------------------------------------------------------------------------
   8. INICIALIZAÇÃO
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupModals();
  setupPedidosActions();
  setupEstoqueActions();
  setupStaff();

  // Modo local estável: não sobrescreve cadastros com consultas bloqueadas por RLS.

renderDashboard();
renderPedidos();
renderEstoque();
renderStaff();
});