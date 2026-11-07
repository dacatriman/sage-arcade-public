(() => {
  const scores = window.ARCADE_SCORES;
  const weeks = [
    { number: 1, date: '2026-11-13', period: '1–13 Nov' },
    { number: 2, date: '2026-11-20', period: '14–20 Nov' },
    { number: 3, date: '2026-11-27', period: '21–27 Nov' },
    { number: 4, date: '2026-12-04', period: '28 Nov–4 Dec' },
    { number: 5, date: '2026-12-11', period: '5–11 Dec' },
    { number: 6, date: '2026-12-18', period: '12–18 Dec' },
    { number: 7, date: '2026-12-25', period: '19–25 Dec' },
    { number: 8, date: '2026-12-31', period: '26–31 Dec' },
  ];
  const teams = [
    { id: 'A', name: 'Pixel Outlaws', color: '#ffb33f', icon: '✦', logo: 'assets/logos/pixel-outlaws.png' },
    { id: 'B', name: 'The Final Credits', color: '#67d8ff', icon: '◆', logo: 'assets/logos/the-final-credits.png' },
    { id: 'C', name: 'Glitch Raiders', color: '#be8cff', icon: '⌁', logo: 'assets/logos/glitch-raiders.png' },
  ];
  const products = ['Sage 50 + Active', 'Sage 200', 'X3'];
  const colors = { 'Sage 50 + Active': 'var(--s50)', 'Sage 200': 'var(--s200)', X3: 'var(--x3)' };
  const $ = selector => document.querySelector(selector);
  const number = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const percent = value => `${number(value).toFixed(1).replace(/\.0$/, '')}%`;
  const ratioPercent = value => percent(value * 100);
  const closed = Math.max(0, Math.min(8, Number.isInteger(scores?.closedStage) ? scores.closedStage : 0));

  function metrics(team) {
    const ratios = products.map(product => number(scores?.teams?.[team.id]?.products?.[product]) / 100);
    const balance = Math.cbrt(ratios.reduce((value, ratio) => value * Math.min(ratio, 1.2), 1));
    const good = ratios.filter(ratio => ratio >= .8).length;
    return { balance, good, eligible: good === 3 };
  }

  function renderStages() {
    $('#stage-map').innerHTML = weeks.map(week => {
      const done = week.number <= closed;
      const active = week.number === Math.min(closed + 1, 8);
      const date = new Date(`${week.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
      return `<div class="stage ${done ? 'done' : ''} ${active && !done ? 'active' : ''}"><div class="stage-top"><span>STAGE</span><span>${done ? '✓' : active ? '●' : '○'}</span></div><div class="stage-num">${String(week.number).padStart(2, '0')}</div><div class="stage-date">${date}</div><div class="stage-icons">${teams.map(team => `<i style="background:${done || active ? team.color : '#3a455c'}"></i>`).join('')}</div></div>`;
    }).join('');
    $('#stage-note').textContent = closed ? `${closed} of 8 stages closed` : 'The first close is 13 November';
  }

  function renderTeams() {
    const stage = Math.min(closed + 1, 8);
    $('#teams').innerHTML = teams.map(team => {
      const row = scores?.teams?.[team.id] || { overall: 0, products: {} };
      const overall = number(row.overall);
      const filled = Math.min(overall / 100, 1);
      const chunks = Array.from({ length: 15 }, (_, index) => `<span class="${index / 15 < filled ? '' : 'empty'}" style="flex:1"></span>`).join('');
      const productRows = products.map(product => {
        const value = number(row.products?.[product]);
        return `<div class="product-row"><div class="product-meta"><span>${product}</span><strong style="color:${colors[product]}">${percent(value)}</strong></div><div class="track"><div class="fill" style="width:${Math.min(100, value)}%;background:${colors[product]}"></div></div></div>`;
      }).join('');
      const balance = metrics(team);
      const logo = `<img src="${team.logo}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span style="display:none">${team.icon}</span>`;
      return `<article class="team-card ${team.id.toLowerCase()}"><div class="team-head"><div class="team-avatar" style="color:${team.color}">${logo}</div><div><div class="team-name">${team.name}</div><div class="team-code">TEAM ${team.id}</div></div><span class="stage-tag">STAGE ${String(stage).padStart(2, '0')}</span></div><div class="life-wrap"><div class="life-line"><span class="life-label">MISSION HEALTH</span><span class="life-val" style="color:${team.color}">${percent(overall)}</span></div><div class="life-sub">Cumulative attainment · ${closed ? `${closed} stages closed` : 'awaiting first close'}</div><div class="life-bar" aria-label="Mission health ${percent(overall)}">${chunks}</div></div><div class="team-divider"></div><div class="product-title">PRODUCT CONTRIBUTION</div>${productRows}<div class="team-bottom"><div class="balance"><small>BALANCE INDEX</small><strong class="${closed ? '' : 'muted'}">${closed ? ratioPercent(balance.balance) : '—'}</strong></div><div class="sqo"><small>OVERALL ATTAINMENT</small><strong>${percent(overall)}</strong></div></div></article>`;
    }).join('');
  }

  function renderRanking() {
    if (!closed) {
      $('#ranking-title').textContent = 'No results yet';
      $('#ranking').innerHTML = teams.map((team, index) => `<div class="rank-row"><div class="rank-num">0${index + 1}</div><div class="rank-name" style="color:${team.color}">${team.name}<div class="rank-detail">Waiting for the first close</div></div><div class="rank-value">—</div></div>`).join('');
      $('#ranking-foot').textContent = 'Publish the first weekly close to see progress.';
      return;
    }
    const ranked = teams.map(team => ({ ...team, ...metrics(team) })).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.balance - a.balance);
    $('#ranking-title').textContent = closed === 8 ? 'Result under proposed rule' : 'Provisional pace';
    $('#ranking').innerHTML = ranked.map((team, index) => `<div class="rank-row"><div class="rank-num">0${index + 1}</div><div class="rank-name" style="color:${team.color}">${team.name}<div class="rank-detail">${team.good}/3 products at 80% of target ${team.eligible ? '· eligible' : '· not yet eligible'}</div></div><div class="rank-value">${ratioPercent(team.balance)}</div></div>`).join('');
    $('#ranking-foot').textContent = 'This is a provisional comparison. The final prize rule still needs approval.';
  }

  function renderHeader() {
    const next = weeks[Math.min(closed, 7)];
    $('#next-date').textContent = closed === 8 ? '31 DEC' : new Date(`${next.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    $('#next-sub').textContent = closed === 8 ? 'Season complete' : `Stage ${String(next.number).padStart(2, '0')} · ${next.period}`;
    $('#data-label').textContent = scores?.testData
      ? `TEST DATA · ${closed} STAGES CLOSED`
      : closed ? `PUBLIC DATA · ${closed} STAGES CLOSED` : 'NO DATA · NO STAGES CLOSED';
    $('#updated-label').textContent = scores?.updatedAt && !Number.isNaN(Date.parse(scores.updatedAt))
      ? `${scores?.testData ? 'Test data · ' : ''}Updated ${new Date(scores.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
      : 'Awaiting first update';
  }

  renderHeader();
  renderStages();
  renderTeams();
  renderRanking();
})();
