// js/index.js
(() => {
  // ====== 可調整區 ======
  const API_BASE = 'https://127.0.0.1:8443';    // 你的 Spring Boot 位址
  const YEAR = 2025;                           // 想顯示哪一年（先用 2025）
  // =====================

  const DAY_FOR_YEAR = `${YEAR}-12-31`;        // 年末查詢日
  const $ = (q) => document.querySelector(q);
  const fmtMoney = (n) => `$ ${Number(n || 0).toLocaleString()}`;
  const pickNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      // 抓試算表總覽
      const tb = await getTrialBalance(DAY_FOR_YEAR);
      console.log('[trial-balance raw]', tb);

      // 正規化
      const norm = normalize(tb);
      console.log('[normalized]', norm);

      // 數字上牆（左兩張卡＋右側摘要都有 data-bind）
      bindAmount('incomeTotal', norm.incomeTotal);
      bindAmount('expenseTotal', norm.expenseTotal);
      bindAmount('profitTotal', norm.profitTotal);

      // 畫甜甜圈（有資料→ conic-gradient；沒資料→ 外圈）
      const incomeDiv  = $('.circle[data-chart="income"]');
      const expenseDiv = $('.circle[data-chart="expense"]');
      if (incomeDiv)  renderDonut(incomeDiv,  norm.incomeSeg,  true);
      if (expenseDiv) renderDonut(expenseDiv, norm.expenseSeg, false);
    } catch (err) {
      console.error('[init] 失敗：', err);
      // 失敗就保持原樣（空圈圈），不打擾畫面
    }
  }

  // 呼叫後端
  async function getTrialBalance(day) {
    const url = `${API_BASE}/api/trial-balance/${encodeURIComponent(day)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
    }
    return res.json();
  }

 function normalize(tb) {
  if (!tb || typeof tb !== 'object') {
    return { incomeTotal: 0, expenseTotal: 0, profitTotal: 0, incomeSeg: [], expenseSeg: [] };
  }

  const details = Array.isArray(tb.details) ? tb.details : [];

  const income = [];
  const expense = [];

  details.forEach(it => {
    const code = (it.accountCode || "").toString();
    const name = it.accountName || code || "未命名";
    const amt  = Number(it.balance) || 0;

    if (!amt) return;

    if (/^4/.test(code)) { // 收入類
      income.push({ name, amount: Math.abs(amt) });
    } else if (/^(5|6)/.test(code)) { // 費用類
      expense.push({ name, amount: Math.abs(amt) });
    }
  });

  const incomeTotal  = income.reduce((s,x) => s+x.amount,0);
  const expenseTotal = expense.reduce((s,x) => s+x.amount,0);
  const profitTotal  = incomeTotal - expenseTotal;

  return {
    incomeTotal,
    expenseTotal,
    profitTotal,
    incomeSeg: income,
    expenseSeg: expense
  };
}


  function emptyNorm() {
    return { incomeTotal: 0, expenseTotal: 0, profitTotal: 0, incomeSeg: [], expenseSeg: [] };
  }
  function toSegArray(v) {
    const arr = Array.isArray(v) ? v : (Array.isArray(v?.items) ? v.items : []);
    return arr.map(x => ({ name: x.name ?? x.category ?? '未命名', amount: pickNum(x.amount ?? x.value) }))
              .filter(x => x.amount > 0);
  }
  function mergeByName(list) {
    const m = new Map();
    for (const x of list) m.set(x.name, (m.get(x.name) || 0) + pickNum(x.amount));
    return [...m.entries()].map(([name, amount]) => ({ name, amount })).sort((a,b)=>b.amount-a.amount);
  }
  function sum(a){ return a.reduce((s,n)=>s + pickNum(n||0), 0); }

  // 綁定金額到多個 data-bind
  function bindAmount(key, val) {
    document.querySelectorAll(`[data-bind="${key}"]`).forEach(el => {
      el.textContent = fmtMoney(val);
    });
  }

  // 畫甜甜圈：有資料→ conic-gradient；無資料→保留外圈
  function renderDonut(div, segments, isIncome) {
    const card = div.closest('.card');
    if (!segments || !segments.length) {
      card?.removeAttribute('data-has-chart');
      div.style.background = '#fff';
      return;
    }
    const total = sum(segments.map(s => s.amount));
    if (total <= 0) {
      card?.removeAttribute('data-has-chart');
      div.style.background = '#fff';
      return;
    }
    // 色盤
    const palette = isIncome
      ? ['#16a34a','#22c55e','#86efac','#10b981','#4ade80']
      : ['#f97316','#fb923c','#fdba74','#ea580c','#f59e0b'];

    let acc = 0;
    const stops = segments.map((seg, i) => {
      const from = (acc/total) * 360; acc += pickNum(seg.amount);
      const to   = (acc/total) * 360;
      const color = palette[i % palette.length];
      return `${color} ${from}deg ${to}deg`;
    }).join(', ');

    div.style.background = `conic-gradient(${stops})`;
    card?.setAttribute('data-has-chart', '1');
  }
})();
