(function (window, document) {
  const DASHBOARD_ENDPOINT = "dashboard.json";
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fmtNumber(n) {
    const s = String(Math.round(Number(n) || 0));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function svg(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function renderGauge(percent) {
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    // Размеры как в Figma: ~190.5 × 106.4
    const width = 190;
    const height = 106;
    const cx = width / 2;
    const cy = height - Math.round((26 * height) / 230);
    const r = Math.round((176 * width) / 420);

    const start = Math.PI;
    const end = 2 * Math.PI;
    const value = start + (p / 100) * Math.PI;

    const s = svg("svg");
    s.setAttribute("viewBox", `0 0 ${width} ${height}`);
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    s.classList.add("analytics-dashboard-gauge");

    const arc = (a0, a1) => {
      const x0 = cx + r * Math.cos(a0);
      const y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const large = a1 - a0 > Math.PI ? 1 : 0;
      return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
    };

    const defs = svg("defs");
    const gradId = `gaugeFill-${Math.random().toString(36).slice(2, 9)}`;
    const grad = svg("linearGradient");
    grad.setAttribute("id", gradId);
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    grad.setAttribute("x1", String(cx));
    grad.setAttribute("y1", String(cy));
    grad.setAttribute("x2", String(cx));
    grad.setAttribute("y2", String(cy - r));
    const st1 = svg("stop");
    st1.setAttribute("offset", "0%");
    st1.setAttribute("stop-color", "#FFFFFF");
    st1.setAttribute("stop-opacity", "1");
    const st2 = svg("stop");
    st2.setAttribute("offset", "100%");
    st2.setAttribute("stop-color", "#F28F97");
    st2.setAttribute("stop-opacity", "0.85");
    grad.appendChild(st1);
    grad.appendChild(st2);
    defs.appendChild(grad);
    s.appendChild(defs);

    const fillPath = svg("path");
    const leftX = cx + r * Math.cos(start);
    const leftY = cy + r * Math.sin(start);
    const rightX = cx + r * Math.cos(end);
    const rightY = cy + r * Math.sin(end);
    fillPath.setAttribute(
      "d",
      `M ${leftX} ${leftY} A ${r} ${r} 0 0 1 ${rightX} ${rightY} L ${cx} ${cy} Z`
    );
    fillPath.setAttribute("fill", `url(#${gradId})`);
    s.appendChild(fillPath);

    const ringW = Math.round((24 * width) / 420);
    const ringBase = svg("path");
    ringBase.setAttribute("d", arc(start, end));
    ringBase.setAttribute("stroke", "#FFFFFF");
    ringBase.setAttribute("stroke-width", String(ringW));
    ringBase.setAttribute("fill", "none");
    ringBase.setAttribute("stroke-linecap", "butt");
    s.appendChild(ringBase);

    const segColors = ["#FF4D4D", "#F58A8A", "#F2D94C", "#CBDC1A", "#86C832", "#22C55E"];
    const segCount = segColors.length;
    const edgePadDeg = 0.42;
    const segGapDeg = 0.78;
    const totalGapDeg = segGapDeg * (segCount - 1);
    const segAngleDeg = (180 - edgePadDeg * 2 - totalGapDeg) / segCount;
    const segStroke = Math.max(6, Math.round((18 * width) / 420));

    segColors.forEach((color, idx) => {
      const a0Deg = 180 + edgePadDeg + idx * (segAngleDeg + segGapDeg);
      const a1Deg = a0Deg + segAngleDeg;
      const a0 = (a0Deg * Math.PI) / 180;
      const a1 = (a1Deg * Math.PI) / 180;
      const path = svg("path");
      path.setAttribute("d", arc(a0, a1));
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", String(segStroke));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "butt");
      s.appendChild(path);
    });

    const tickIn = Math.round((32 * width) / 420);
    const tickOut = Math.round((16 * width) / 420);
    const twM = Math.max(1, (2.6 * width) / 420);
    const twN = Math.max(0.7, (1.3 * width) / 420);
    for (let i = 0; i <= 42; i++) {
      const a = start + (i / 42) * Math.PI;
      const x0 = cx + (r - tickIn) * Math.cos(a);
      const y0 = cy + (r - tickIn) * Math.sin(a);
      const x1 = cx + (r - tickOut) * Math.cos(a);
      const y1 = cy + (r - tickOut) * Math.sin(a);
      const tick = svg("line");
      tick.setAttribute("x1", String(x0));
      tick.setAttribute("y1", String(y0));
      tick.setAttribute("x2", String(x1));
      tick.setAttribute("y2", String(y1));
      tick.setAttribute("stroke", "#FFFFFF");
      tick.setAttribute("stroke-opacity", "0.7");
      tick.setAttribute("stroke-width", i % 7 === 0 ? String(twM) : String(twN));
      s.appendChild(tick);
    }

    const needleLen = r - Math.round((34 * width) / 420);
    const baseW = Math.max(5, Math.round((16 * width) / 420));
    const tipX = cx + needleLen * Math.cos(value);
    const tipY = cy + needleLen * Math.sin(value);
    const b1x = cx + (baseW / 2) * Math.cos(value + Math.PI / 2);
    const b1y = cy + (baseW / 2) * Math.sin(value + Math.PI / 2);
    const b2x = cx + (baseW / 2) * Math.cos(value - Math.PI / 2);
    const b2y = cy + (baseW / 2) * Math.sin(value - Math.PI / 2);
    const needle = svg("path");
    needle.setAttribute("d", `M ${b1x} ${b1y} L ${tipX} ${tipY} L ${b2x} ${b2y} Z`);
    needle.setAttribute("fill", "#2F343B");
    s.appendChild(needle);

    const hubR = Math.round((16 * width) / 420);
    const hubInner = Math.round((14 * width) / 420);
    const hubStroke = Math.max(2, Math.round((5 * width) / 420));

    const hubRing = svg("circle");
    hubRing.setAttribute("cx", String(cx));
    hubRing.setAttribute("cy", String(cy));
    hubRing.setAttribute("r", String(hubR));
    hubRing.setAttribute("fill", "none");
    hubRing.setAttribute("stroke", "#FFFFFF");
    hubRing.setAttribute("stroke-width", String(hubStroke));
    s.appendChild(hubRing);

    const hub = svg("circle");
    hub.setAttribute("cx", String(cx));
    hub.setAttribute("cy", String(cy));
    hub.setAttribute("r", String(hubInner));
    hub.setAttribute("fill", "#2F343B");
    s.appendChild(hub);

    const badgeW = Math.round((62 * width) / 420);
    const badgeH = Math.round((30 * height) / 230);
    const badgeY = Math.round((62 * height) / 230);
    const badgeRx = Math.max(4, Math.round((7 * width) / 420));

    const badge = svg("rect");
    badge.setAttribute("x", String(cx - badgeW / 2));
    badge.setAttribute("y", String(badgeY));
    badge.setAttribute("width", String(badgeW));
    badge.setAttribute("height", String(badgeH));
    badge.setAttribute("rx", String(badgeRx));
    badge.setAttribute("fill", "#F28F97");
    badge.setAttribute("opacity", "0.92");
    s.appendChild(badge);

    const badgeText = svg("text");
    badgeText.setAttribute("x", String(cx));
    badgeText.setAttribute("y", String(badgeY + badgeH / 2));
    badgeText.setAttribute("dominant-baseline", "middle");
    badgeText.setAttribute("text-anchor", "middle");
    badgeText.setAttribute("class", "analytics-dashboard-gauge-text");
    badgeText.textContent = `${p}%`;
    s.appendChild(badgeText);

    return s;
  }

  function renderBars(items) {
    const wrap = el("div", "analytics-dashboard-bars");
    items.forEach((row) => {
      const r = el("div", "analytics-dashboard-bar-row");
      r.appendChild(el("div", "analytics-dashboard-bar-name", row.name));
      const bar = el("div", "analytics-dashboard-bar");
      const fill = el("div", "analytics-dashboard-bar-fill");
      const pct = Math.max(0, Math.min(150, Number(row.percent) || 0));
      fill.style.width = `${Math.min(pct, 125)}%`;
      fill.style.background = pct >= 100 ? "#BBF7D0" : pct >= 75 ? "#FDE68A" : "#FECACA";
      fill.appendChild(el("span", "analytics-dashboard-bar-pct", `${Math.round(pct)}%`));
      bar.appendChild(fill);
      r.appendChild(bar);
      wrap.appendChild(r);
    });
    return wrap;
  }

  function renderMiniDonut(percent, size) {
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    const s = svg("svg");
    s.classList.add("analytics-dashboard-donut");
    s.setAttribute("viewBox", "0 0 100 100");
    const r = 36;
    const c = 2 * Math.PI * r;
    const track = svg("circle");
    track.setAttribute("cx", "50");
    track.setAttribute("cy", "50");
    track.setAttribute("r", String(r));
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", "#E4E8F2");
    track.setAttribute("stroke-width", "10");
    s.appendChild(track);

    const arc = svg("circle");
    arc.setAttribute("cx", "50");
    arc.setAttribute("cy", "50");
    arc.setAttribute("r", String(r));
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "#E97A7A");
    arc.setAttribute("stroke-width", "10");
    arc.setAttribute("stroke-dasharray", `${(c * p) / 100} ${c}`);
    arc.setAttribute("stroke-linecap", "round");
    arc.setAttribute("transform", "rotate(-90 50 50)");
    s.appendChild(arc);

    const t = svg("text");
    t.setAttribute("x", "50");
    t.setAttribute("y", "56");
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("class", "analytics-dashboard-donut-text");
    t.textContent = `${p}%`;
    s.appendChild(t);

    if (size) {
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
    }
    return s;
  }

  function ringSectorPath(cx, cy, rOuter, rInner, a0, a1) {
    const la = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + rOuter * Math.cos(a0);
    const y0 = cy + rOuter * Math.sin(a0);
    const x1 = cx + rOuter * Math.cos(a1);
    const y1 = cy + rOuter * Math.sin(a1);
    const x2 = cx + rInner * Math.cos(a1);
    const y2 = cy + rInner * Math.sin(a1);
    const x3 = cx + rInner * Math.cos(a0);
    const y3 = cy + rInner * Math.sin(a0);
    return [
      `M ${x0} ${y0}`,
      `A ${rOuter} ${rOuter} 0 ${la} 1 ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${rInner} ${rInner} 0 ${la} 0 ${x3} ${y3}`,
      "Z"
    ].join(" ");
  }

  function renderResultPerPerson(resultPerPerson) {
    const percent = Math.max(0, Math.min(100, Number(resultPerPerson?.percent) || 0));
    const amount = fmtNumber(resultPerPerson?.amount || 0);
    const planAmount = fmtNumber(resultPerPerson?.planAmount || 0);

    const wrap = el("div", "analytics-dashboard-perperson-wrap");
    const s = svg("svg");
    s.classList.add("analytics-dashboard-perperson-chart");
    s.setAttribute("viewBox", "0 0 220 190");

    const cx = 110;
    const cy = 104;
    const rOuter = 86;
    const rInner = 57;
    const gapDeg = 58;
    const startDeg = 90 + gapDeg / 2;
    const sweepDeg = 360 - gapDeg;
    const endDeg = startDeg + sweepDeg;
    const valueEndDeg = startDeg + (sweepDeg * percent) / 100;

    const toRad = (d) => (d * Math.PI) / 180;

    const track = svg("path");
    track.setAttribute("d", ringSectorPath(cx, cy, rOuter, rInner, toRad(startDeg), toRad(endDeg)));
    track.setAttribute("fill", "#D1D5DB");
    s.appendChild(track);

    const value = svg("path");
    value.setAttribute("d", ringSectorPath(cx, cy, rOuter, rInner, toRad(startDeg), toRad(valueEndDeg)));
    value.setAttribute("fill", "#F5C2C6");
    s.appendChild(value);

    const center = svg("text");
    center.setAttribute("x", String(cx));
    center.setAttribute("y", String(cy + 6));
    center.setAttribute("text-anchor", "middle");
    center.setAttribute("class", "analytics-dashboard-perperson-pct");
    center.textContent = `${percent}%`;
    s.appendChild(center);

    wrap.appendChild(s);

    const scale = el("div", "analytics-dashboard-perperson-scale");
    scale.appendChild(el("span", "analytics-dashboard-perperson-min", "0"));
    scale.appendChild(el("span", "analytics-dashboard-perperson-max", planAmount));
    wrap.appendChild(scale);

    wrap.appendChild(el("div", "analytics-dashboard-amount", amount));
    return wrap;
  }

  function renderClientsSources(items) {
    const list = Array.isArray(items) ? items : [];
    const box = el("div", "analytics-dashboard-sources");

    const size = 140;
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = 53;
    const rInner = 24;
    const gapRad = 0.032;

    const donut = svg("svg");
    donut.classList.add("analytics-dashboard-sources-donut");
    donut.setAttribute("viewBox", `0 0 ${size} ${size}`);
    donut.setAttribute("aria-hidden", "true");

    const total = list.reduce((s, it) => s + Math.max(0, Number(it.percent) || 0), 0) || 1;
    const gapCount = list.length;
    const sweepAvail = 2 * Math.PI - gapCount * gapRad;

    let theta = -Math.PI / 2;

    const donutSectorPath = (a0, a1) => {
      const la = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
      const x0 = cx + rOuter * Math.cos(a0);
      const y0 = cy + rOuter * Math.sin(a0);
      const x1 = cx + rOuter * Math.cos(a1);
      const y1 = cy + rOuter * Math.sin(a1);
      const x2 = cx + rInner * Math.cos(a1);
      const y2 = cy + rInner * Math.sin(a1);
      const x3 = cx + rInner * Math.cos(a0);
      const y3 = cy + rInner * Math.sin(a0);
      return [
        `M ${x0} ${y0}`,
        `A ${rOuter} ${rOuter} 0 ${la} 1 ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${rInner} ${rInner} 0 ${la} 0 ${x3} ${y3}`,
        "Z"
      ].join(" ");
    };

    list.forEach((seg) => {
      const p = Math.max(0, Math.min(100, Number(seg.percent) || 0));
      const frac = p / total;
      const sweep = frac * sweepAvail;
      const a0 = theta;
      const a1 = theta + sweep;
      theta = a1 + gapRad;

      const path = svg("path");
      path.setAttribute("d", donutSectorPath(a0, a1));
      path.setAttribute("fill", seg.color || "#9CA3AF");
      path.setAttribute("stroke", "#ffffff");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linejoin", "round");
      donut.appendChild(path);

      const mid = (a0 + a1) / 2;
      const rLabel = (rInner + rOuter) / 2;
      const tx = cx + rLabel * Math.cos(mid);
      const ty = cy + rLabel * Math.sin(mid);
      const t = svg("text");
      t.setAttribute("x", String(tx));
      t.setAttribute("y", String(ty));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("class", "analytics-dashboard-sources-segment-pct");
      t.textContent = `${Math.round(p)}%`;
      donut.appendChild(t);
    });

    const legend = el("div", "analytics-dashboard-sources-legend");
    list.forEach((i) => {
      const row = el("div", "analytics-dashboard-legend-item");
      const sw = el("span", "analytics-dashboard-legend-swatch");
      sw.style.background = i.color || "#9CA3AF";
      row.appendChild(sw);
      row.appendChild(el("span", "analytics-dashboard-legend-label", i.label || ""));
      legend.appendChild(row);
    });

    box.appendChild(donut);
    box.appendChild(legend);
    return box;
  }

  function renderKeyValueList(rows) {
    const wrap = el("div", "analytics-dashboard-kvlist");
    rows.forEach(({ label, value, strong }) => {
      const r = el("div", "analytics-dashboard-kvrow");
      r.appendChild(el("div", "analytics-dashboard-kvlabel", label));
      const v = el("div", strong ? "analytics-dashboard-kvvalue is-strong" : "analytics-dashboard-kvvalue", value);
      r.appendChild(v);
      wrap.appendChild(r);
    });
    return wrap;
  }

  function renderLineChart(points) {
    const wrap = el("div", "analytics-dashboard-dependence");

    if (!points.length) return wrap;

    const row = el("div", "analytics-dashboard-dependence-row");

    const labelLeft = el("div", "dep-label", "% РОП");
    row.appendChild(labelLeft);

    const axis = svg("svg");
    axis.setAttribute("viewBox", "0 0 520 60");
    axis.classList.add("dep-axis");

    const startX = 40;
    const endX = 500;
    const y = 30;

    // линия
    const line = svg("line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", y);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#111827");
    line.setAttribute("stroke-width", "2");
    axis.appendChild(line);

    // стрелка вправо
    const arrow = svg("path");
    arrow.setAttribute(
        "d",
        `M ${endX} ${y} l -8 -5 M ${endX} ${y} l -8 5`
    );
    arrow.setAttribute("stroke", "#111827");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("fill", "none");
    axis.appendChild(arrow);

    const step = (endX - startX) / (points.length - 1);

    points.forEach((p, i) => {
      const x = startX + step * i;

      // верхние значения % РОП
      const top = svg("text");
      top.setAttribute("x", x);
      top.setAttribute("y", 12);
      top.setAttribute("text-anchor", "middle");
      top.setAttribute("class", "dep-rop");
      top.textContent = `${p.rop}%`;
      axis.appendChild(top);

      // точка у 7%
      if (i === 0) {
        const dot = svg("circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", "4");
        dot.setAttribute("fill", "#111827");
        axis.appendChild(dot);

        top.classList.add("current");
      }

      // стрелки начиная после 8%
      if (i > 0 && i < points.length - 1) {
        const midX = x + step / 2;

        const arrow = svg("text");
        arrow.setAttribute("x", midX);
        arrow.setAttribute("y", y + 5);
        arrow.setAttribute("text-anchor", "middle");
        arrow.setAttribute("class", "dep-arrow");
        arrow.textContent = "»";
        axis.appendChild(arrow);

        // KPI начиная со стрелки между 8% и 9%
        const bottom = svg("text");
        bottom.setAttribute("x", midX);
        bottom.setAttribute("y", 55);
        bottom.setAttribute("text-anchor", "middle");
        bottom.setAttribute("class", "dep-kpi");
        bottom.textContent = `${points[i].kpi}%`;
        axis.appendChild(bottom);
      }
    });

    row.appendChild(axis);
    wrap.appendChild(row);

    const kpiLabel = el("div", "dep-kpi-label", "Текущий KPI:");
    wrap.appendChild(kpiLabel);

    return wrap;
  }

  function renderDashboard(data) {
    const root = document.getElementById("analytics-dashboard-container");
    if (!root) return;
    root.innerHTML = "";

    const planCard = el("div", "analytics-dashboard-card analytics-dashboard-card-plan");
    const info = el("div", "analytics-dashboard-info", "i");
    planCard.appendChild(info);

    const planGrid = el("div", "analytics-dashboard-plan-grid");
    const left = el("div", "analytics-dashboard-plan-left");
    const blockTop = el("div", "analytics-dashboard-plan-block");
    blockTop.appendChild(el("div", "analytics-dashboard-plan-value", fmtNumber(data.plan.quarterPlan)));
    blockTop.appendChild(el("div", "analytics-dashboard-plan-label", "Квартальный план"));
    const blockBottom = el("div", "analytics-dashboard-plan-block");
    blockBottom.appendChild(
      el("div", "analytics-dashboard-plan-value analytics-dashboard-plan-value-secondary", fmtNumber(data.plan.departmentResult))
    );
    blockBottom.appendChild(el("div", "analytics-dashboard-plan-label", "Результат отдела"));
    left.appendChild(blockTop);
    left.appendChild(blockBottom);

    const right = el("div", "analytics-dashboard-plan-right");
    const chartWrap = el("div", "analytics-dashboard-plan-chart-wrap");
    chartWrap.appendChild(renderGauge(data.plan.progressPercent));
    right.appendChild(chartWrap);
    const foot = el("div", "analytics-dashboard-plan-foot");
    foot.appendChild(el("div", "analytics-dashboard-plan-foot-item", `Факт: ${fmtNumber(data.plan.departmentResult)}`));
    foot.appendChild(el("div", "analytics-dashboard-plan-foot-item", `План: ${fmtNumber(data.plan.quarterPlan)}`));
    right.appendChild(foot);

    planGrid.appendChild(left);
    planGrid.appendChild(right);
    planCard.appendChild(planGrid);
    root.appendChild(planCard);

    const planByEmp = el("div", "analytics-dashboard-card analytics-dashboard-card-sales");
    planByEmp.appendChild(el("div", "analytics-dashboard-title", "Выполнение плана продаж"));
    planByEmp.appendChild(renderBars(data.salesPlanByEmployee));
    root.appendChild(planByEmp);

    const topCol4 = el("div", "analytics-dashboard-top-col4");
    const sources = el("div", "analytics-dashboard-card analytics-dashboard-card-sources");
    sources.appendChild(el("div", "analytics-dashboard-info", "i"));
    sources.appendChild(el("div", "analytics-dashboard-title", "Источники клиентов"));
    sources.appendChild(renderClientsSources(data.clientsSources));

    const perPerson = el("div", "analytics-dashboard-card analytics-dashboard-card-per-person");
    perPerson.appendChild(el("div", "analytics-dashboard-info", "i"));
    perPerson.appendChild(el("div", "analytics-dashboard-title", "Результат на человека"));
    perPerson.appendChild(renderResultPerPerson(data.resultPerPerson));
    topCol4.appendChild(sources);
    topCol4.appendChild(perPerson);
    root.appendChild(topCol4);

    const kpi = el("div", "analytics-dashboard-card analytics-dashboard-card-kpi");
    kpi.appendChild(el("div", "analytics-dashboard-title", "KPI по кварталу"));
    kpi.appendChild(el("div", "analytics-dashboard-kpi", `${data.kpiQuarter}%`));
    root.appendChild(kpi);

    const rotation = el("div", "analytics-dashboard-card analytics-dashboard-card-rotation");
    rotation.appendChild(el("div", "analytics-dashboard-title", "Ротация сотрудников"));
    rotation.appendChild(
        renderKeyValueList([
          { label: "Принято:", value: String(data.rotation.accepted), strong: true },
          { label: "Уволено:", value: String(data.rotation.fired), strong: true }
        ])
    );
    root.appendChild(rotation);

    const deptRating = el("div", "analytics-dashboard-card analytics-dashboard-card-dept-rating");

    deptRating.appendChild(
        el("div", "analytics-dashboard-title", "Текущий рейтинг отдела")
    );

    deptRating.appendChild(
        renderKeyValueList([
          { label: "Текущий:", value: String(data.departmentRating.currentPlace), strong: true },
          { label: "Лучший:", value: String(data.departmentRating.bestPlace), strong: true },
          { label: "Худший:", value: String(data.departmentRating.worstPlace), strong: true }
        ])
    );

    const remain = el("div", "analytics-dashboard-sub");
    remain.innerHTML =
        `Остаток до повышения: <strong>${fmtNumber(data.departmentRating.increaseRemaining)}</strong>`;

    deptRating.appendChild(remain);

    root.appendChild(deptRating);

    const top5 = el("div", "analytics-dashboard-card analytics-dashboard-card-top5");
    top5.appendChild(el("div", "analytics-dashboard-title", "ТОП 5 достижений:"));
    top5.appendChild(
        renderKeyValueList(
            (Array.isArray(data.top5Achievements) ? data.top5Achievements : []).map((i) => ({
              label: i.label,
              value: fmtNumber(i.amount),
              strong: true
            }))
        )
    );
    root.appendChild(top5);

    const empResults = el(
        "div",
        "analytics-dashboard-card analytics-dashboard-card-employee-results"
    );

    empResults.appendChild(
        el("div", "analytics-dashboard-title", "Результаты сотрудников")
    );

    empResults.appendChild(
        renderBars(data.employeeResults || data.salesPlanByEmployee || [])
    );

    root.appendChild(empResults);

    const deals = el("div", "analytics-dashboard-card analytics-dashboard-card-deals");
    deals.appendChild(el("div", "analytics-dashboard-title", "Сделки"));
    deals.appendChild(
        renderKeyValueList([
          { label: "Открытые", value: String(data.deals.opened), strong: true },
          { label: "На проверке", value: String(data.deals.review), strong: true },
          { label: "Закрытых", value: String(data.deals.closed), strong: true },
          { label: "Отказных", value: String(data.deals.rejected), strong: true }
        ])
    );
    root.appendChild(deals);

    const dep = el("div", "analytics-dashboard-card analytics-dashboard-card-dependence");
    dep.appendChild(el("div", "analytics-dashboard-title", "Зависимость % РОП от выполнения KPI"));
    dep.appendChild(renderLineChart(data.kpiDependence || []));
    root.appendChild(dep);
  }

  async function initDashboard(config) {
    const endpoint = config?.endpoint || DASHBOARD_ENDPOINT;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to load dashboard data");
    const data = await response.json();
    renderDashboard(data);
  }

  window.initDashboard = initDashboard;
})(window, document);

