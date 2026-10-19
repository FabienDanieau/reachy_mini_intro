// Apps and moves over time: Hub Spaces tagged as Reachy Mini apps (by createdAt) and moves in the
// datasets tagged reachy_mini_community_moves (dated by their dataset's createdAt; the synthetic
// binhpham/reachy-mini-motion-synth set is left out), and the social-wall posts shown on the wall
// (pollen-robotics/reachy-mini-social-posts, kept, by created_at). Cumulative by month, snapshot 2026-10-16.
(() => {
    const ROWS = [["2025-07", 1, 0, 160], ["2025-08", 1, 85, 176], ["2025-09", 1, 104, 195], ["2025-10", 4, 104, 217], ["2025-11", 7, 104, 244], ["2025-12", 50, 105, 347], ["2026-01", 75, 105, 442], ["2026-02", 123, 132, 516], ["2026-03", 159, 156, 556], ["2026-04", 194, 167, 591], ["2026-05", 320, 180, 717], ["2026-06", 371, 332, 820], ["2026-07", 431, 404, 925], ["2026-08", 483, 411, 1080], ["2026-09", 536, 413, 1279], ["2026-10", 558, 423, 1364]]; // [month, apps, moves, posts]
    // Cumulative flow: bands stacked bottom to top, apps, moves, posts; the top edge is the total.
    const S = [{ key: 1, name: 'apps', cls: 's1' }, { key: 2, name: 'moves', cls: 's2' }, { key: 3, name: 'posts', cls: 's3' }];
    const svg = document.getElementById('growthChart'), tip = document.getElementById('growthTip');
    const W = 1680, H = 760, L = 70, R = 170, T = 20, B = 50, MAX = 2400, N = ROWS.length;
    const x = i => L + i * (W - L - R) / (N - 1), y = v => T + (1 - v / MAX) * (H - T - B);
    const mon = k => new Date(k + '-01T00:00').toLocaleString('en', { month: 'short' });
    const top = (r, n) => S.slice(0, n + 1).reduce((a, s) => a + r[s.key], 0); // stacked height through band n
    let g = '<g class="grid">';
    for (let v = 0; v <= MAX; v += 400) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`;
    g += '</g><g class="axis">';
    for (let v = 0; v <= MAX; v += 800) g += `<text x="${L - 14}" y="${y(v) + 5}" text-anchor="end">${v.toLocaleString('en')}</text>`;
    ROWS.forEach(([k], i) => { if (i % 3 === 0 || i === N - 1) g += `<text x="${x(i)}" y="${H - 14}" text-anchor="middle">${mon(k)}${i === 0 || k.endsWith('-01') ? ' ' + k.slice(0, 4) : ''}</text>`; });
    g += '</g><g class="bands">';
    S.forEach((s, n) => {
        const up = ROWS.map((r, i) => `${x(i).toFixed(1)},${y(top(r, n)).toFixed(1)}`);
        const down = ROWS.map((r, i) => `${x(i).toFixed(1)},${y(n ? top(r, n - 1) : 0).toFixed(1)}`).reverse();
        g += `<polygon class="band ${s.cls}" points="${up.join(' ')} ${down.join(' ')}"/>`;
    });
    g += '</g>';
    const last = ROWS[N - 1];
    S.forEach((s, n) => {
        const mid = (top(last, n) + (n ? top(last, n - 1) : 0)) / 2, v = last[s.key];
        g += `<g class="endmark"><text class="endlabel" x="${x(N - 1) + 22}" y="${y(mid) + 15}">${v.toLocaleString('en')}<tspan class="endname" dx="16">${s.name}</tspan></text></g>`;
    });
    // What's next cards (step 1; the chart is 1280 px wide): at their band's end, spread apart if the ends are closer than a card.
    const K = 1280 / W, cards = [...svg.parentElement.querySelectorAll('.next')], GAP = 150;
    const ys = cards.map(c => { const n = +c.dataset.band; return y((top(last, n) + (n ? top(last, n - 1) : 0)) / 2); });
    const pos = ys.map(v => v * K);
    // Keep cards GAP apart: top to bottom, push each one down past the previous, then shift the group up
    // by half the push so it stays centred on the band ends.
    const order = pos.map((p, k) => k).sort((a, b) => pos[a] - pos[b]), want = pos.slice();
    order.forEach((k, j) => { if (j) pos[k] = Math.max(pos[k], pos[order[j - 1]] + GAP); });
    const shift = order.reduce((a, k) => a + pos[k] - want[k], 0) / order.length / 2;
    order.forEach(k => { pos[k] -= shift; });
    cards.forEach((c, k) => {
        c.style.top = `${pos[k] - 70}px`; // a bit above the band end, clear of the future axis
    });
    // Step 1: the month axis continues, dashed, into the free third (where the cards are).
    const dx = (W - L - R) / (N - 1), FUT = 6, xe = x(N - 1);
    const [ly, lm] = last[0].split('-').map(Number);
    g += '<g class="future">';
    for (let v = 400; v <= MAX; v += 400) g += `<line class="fgrid" x1="${xe}" x2="${xe + FUT * dx}" y1="${y(v)}" y2="${y(v)}"/>`;
    g += `<line class="faxis" x1="${xe}" x2="${xe + FUT * dx}" y1="${y(0)}" y2="${y(0)}"/>`;
    for (let k = 1; k <= FUT; k++) {
        const m = (lm - 1 + k) % 12 + 1, yr = ly + Math.floor((lm - 1 + k) / 12), X = xe + k * dx;
        if (m % 3 === 1) g += `<text x="${X}" y="${H - 14}" text-anchor="middle">${mon(`${yr}-${String(m).padStart(2, '0')}`)}${m === 1 ? ' ' + yr : ''}</text>`;
    }
    g += '</g>';
    g += `<line class="hair" id="growthHair" y1="${T}" y2="${H - B}" visibility="hidden"/>`;
    g += `<rect id="growthHit" x="${L - 20}" y="0" width="${W - L - R + 40}" height="${H}" fill="transparent"/>`;
    svg.insertAdjacentHTML('beforeend', g);
    document.getElementById('growthDesc').textContent = `Cumulative flow of Reachy Mini apps, moves and social posts by month, ${ROWS[0][0]} to ${last[0]}: ${last[1]} apps, ${last[2]} moves, ${last[3]} posts.`;
    document.querySelector('#growthTable tbody').innerHTML = ROWS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
    const hair = document.getElementById('growthHair');
    const show = on => { tip.hidden = !on; hair.setAttribute('visibility', on ? 'visible' : 'hidden'); };
    document.getElementById('growthHit').addEventListener('pointermove', e => {
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
        const i = Math.max(0, Math.min(N - 1, Math.round((p.x - L) / ((W - L - R) / (N - 1)))));
        const r = ROWS[i];
        hair.setAttribute('x1', x(i)); hair.setAttribute('x2', x(i));
        tip.innerHTML = `${mon(r[0])} ${r[0].slice(0, 4)} · <b>${top(r, 2).toLocaleString('en')}</b> total` + [...S].reverse().map(s => `<br><i class="sw ${s.cls}"></i><b>${r[s.key]}</b> ${s.name}`).join('');
        tip.style.left = `${x(i) / W * 100}%`; tip.style.top = `${y(top(r, 2)) / H * 100}%`; // the svg scales uniformly
        show(true);
    });
    document.getElementById('growthHit').addEventListener('pointerleave', () => show(false));
})();
