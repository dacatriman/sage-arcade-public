const teams = [
  { id: 'A', name: 'Pixel Outlaws', color: '#ffb33f' },
  { id: 'B', name: 'The Final Credits', color: '#67d8ff' },
  { id: 'C', name: 'Glitch Raiders', color: '#be8cff' },
];
const products = ['Sage 50 + Active', 'Sage 200', 'X3'];
const dates = ['13 NOV', '20 NOV', '27 NOV', '04 DEC', '11 DEC', '18 DEC', '25 DEC', '31 DEC'];
const pct = n => `${Number(n).toFixed(1).replace(/\.0$/, '')}%`;

function render() {
  const data = window.ARCADE_SCORES;
  if (!data || !Number.isInteger(data.closedStage) || data.closedStage < 0 || data.closedStage > 8) throw new Error('Review assets/data.js');
  document.querySelector('#stages').innerHTML = dates.map((date, i) =>
    `<div class="stage ${i < data.closedStage ? 'closed' : i === data.closedStage ? 'active' : ''}"><small>STAGE</small><strong>${String(i + 1).padStart(2, '0')}</strong><span>${date}</span></div>`
  ).join('');
  document.querySelector('#cards').innerHTML = teams.map(team => {
    const row = data.teams[team.id];
    const productRows = products.map(product => {
      const value = Number(row.products[product]);
      return `<div class="product"><div class="product-head"><span>${product}</span><b>${pct(value)}</b></div><div class="track"><div class="fill" style="--team:${team.color};--fill:${Math.max(0, Math.min(100, value))}%"></div></div></div>`;
    }).join('');
    return `<article class="card"><div class="card-head"><span class="mark" style="color:${team.color}">${team.id}</span><span class="tag">TEAM ${team.id}</span></div><h3>${team.name}</h3><div class="subtle">Overall attainment</div><div class="score"><strong>${pct(row.overall)}</strong></div><div class="track"><div class="fill" style="--team:${team.color};--fill:${Math.max(0, Math.min(100, Number(row.overall)))}%"></div></div><div class="products"><h4>PRODUCT ATTAINMENT</h4>${productRows}</div></article>`;
  }).join('');
  document.querySelector('#updated').textContent = data.updatedAt
    ? `Updated ${new Date(data.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
    : 'Awaiting first update';
}

try { render(); }
catch (error) { document.querySelector('#cards').textContent = error.message; }
