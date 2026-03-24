(function (window, document) {
  const DEPARTMENTS_RATING_ENDPOINT = "departments-rating.json";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const CHART_SIZE = 320;
  const SUCCESS_RADIUS = 132; // 264x264
  const FAIL_RADIUS = 100; // 170x170
  const CENTER = CHART_SIZE / 2;

  function createSvgElement(tagName) {
    return document.createElementNS(SVG_NS, tagName);
  }

  function polarToCartesian(cx, cy, radius, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  }

  function createSectorPath(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const delta = ((endAngle - startAngle) % 360 + 360) % 360;
    const largeArcFlag = delta > 180 ? 1 : 0;

    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z"
    ].join(" ");
  }

  function createSegmentChart(successPercent, failPercent) {
    const normalizedSuccess = Math.max(0, Math.min(100, Number(successPercent) || 0));
    const normalizedFail = Math.max(0, Math.min(100, Number(failPercent) || 100 - normalizedSuccess));
    const total = normalizedSuccess + normalizedFail || 100;
    const successAngle = (normalizedSuccess / total) * 360;
    const failAngle = (normalizedFail / total) * 360;

    const svg = createSvgElement("svg");
    svg.classList.add("analytics-segment-chart");
    svg.setAttribute("viewBox", `0 0 ${CHART_SIZE} ${CHART_SIZE}`);
    svg.setAttribute("aria-label", `Успех ${normalizedSuccess}%, отстают ${normalizedFail}%`);
    svg.setAttribute("role", "img");

    const successPath = createSvgElement("path");
    successPath.setAttribute("d", createSectorPath(CENTER, CENTER, SUCCESS_RADIUS, -90, -90 + successAngle));
    successPath.setAttribute("fill", "#BBF7D0");

    const failPath = createSvgElement("path");
    failPath.setAttribute(
      "d",
      createSectorPath(CENTER, CENTER, FAIL_RADIUS, -90 + successAngle, -90 + successAngle + failAngle)
    );
    failPath.setAttribute("fill", "#FECACA");

    svg.appendChild(successPath);
    svg.appendChild(failPath);

    return svg;
  }

  function createBadge(text, kind) {
    const badge = document.createElement("div");
    badge.className = `analytics-segment-badge analytics-segment-badge-${kind}`;
    badge.textContent = text;
    return badge;
  }

  function createCallout(text, kind) {
    const callout = document.createElement("div");
    callout.className = `analytics-segment-callout analytics-segment-callout-${kind}`;
    callout.textContent = text;
    return callout;
  }

  function renderDepartmentsRatingCharts(data) {
    const container = document.getElementById("analytics-departments-rating-container");
    if (!container) {
      return;
    }

    const departments = Array.isArray(data?.departments) ? data.departments.slice(0, 4) : [];
    container.innerHTML = "";

    departments.forEach((department) => {
      const card = document.createElement("div");
      card.className = "analytics-department-card";

      const title = document.createElement("div");
      title.className = "analytics-department-title";
      title.textContent = department.name || "";

      const chartWrap = document.createElement("div");
      chartWrap.className = "analytics-department-chart-wrap";
      chartWrap.appendChild(createSegmentChart(department.success, department.fail));
      chartWrap.appendChild(createBadge(`${department.success}%`, "fail"));
      chartWrap.appendChild(createBadge(`${department.fail}%`, "success"));
      chartWrap.appendChild(createCallout("Выполнили по мин. план", "fail"));
      chartWrap.appendChild(createCallout("Отстают по мин. плану", "success"));

      card.appendChild(title);
      card.appendChild(chartWrap);
      container.appendChild(card);
    });
  }

  async function initDepartmentsRatingCharts(config) {
    const endpoint = config?.endpoint || DEPARTMENTS_RATING_ENDPOINT;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to load departments rating data");
    }

    const data = await response.json();
    renderDepartmentsRatingCharts(data);
  }

  window.initDepartmentsRatingCharts = initDepartmentsRatingCharts;
})(window, document);
