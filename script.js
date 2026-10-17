// Simple calculator behavior
const displayEl = document.getElementById('display');
let expr = ''; // expression string shown / evaluated

function updateDisplay() {
  displayEl.textContent = expr === '' ? '0' : expr;
}

// Helpers
function safeEval(s) {
  // allow only digits, operators, parentheses, decimal point, spaces
  if (!/^[0-9+\-*/(). %]+$/.test(s)) throw new Error('Invalid characters');
  // Handle percent: convert "x%" to "(x/100)"
  s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
  // Evaluate using Function (slightly safer than eval for this context)
  // eslint-disable-next-line no-new-func
  return Function('"use strict";return (' + s + ')')();
}

function appendValue(v) {
  // prevent two operators in a row (except minus for negative numbers)
  if (/^[+\-*/. ]$/.test(v)) {
    if (expr === '' && (v === '+' || v === '*' || v === '/')) return;
    if (/[+\-*/. ]$/.test(expr) && v !== '-' && v !== '.') {
      // replace last operator with new one
      expr = expr.replace(/[+\-*/. ]+$/, v);
      updateDisplay();
      return;
    }
    // allow minus after operator
  }
  // prevent multiple decimals in a number fragment
  if (v === '.') {
    const parts = expr.split(/[\+\-\*\/\s]/);
    const last = parts[parts.length - 1];
    if (last && last.includes('.')) return;
    if (last === '') v = '0.'; // start decimal with 0.
  }
  expr += v;
  updateDisplay();
}

function clearAll() { expr = ''; updateDisplay(); }
function backspace() { expr = expr.slice(0, -1); updateDisplay(); }

function compute() {
  if (expr === '') return;
  try {
    // Replace user-facing multiply/divide symbols if present
    const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/');
    const result = safeEval(normalized);
    expr = String(result);
    updateDisplay();
  } catch (e) {
    displayEl.textContent = 'Error';
    setTimeout(() => updateDisplay(), 800);
  }
}

// Button clicks
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.value;
    const a = btn.dataset.action;
    if (v !== undefined) appendValue(v);
    if (a === 'clear') clearAll();
    if (a === 'back') backspace();
    if (a === 'equals') compute();
    if (a === 'percent') appendValue('%');
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendValue(e.key);
  else if (e.key === '.') appendValue('.');
  else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') appendValue(e.key);
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); compute(); }
  else if (e.key === 'Backspace') backspace();
  else if (e.key.toLowerCase() === 'c') clearAll();
  else if (e.key === '%') appendValue('%');
});v