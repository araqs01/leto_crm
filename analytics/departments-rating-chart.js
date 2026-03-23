(function (window, document) {
  const DEPARTMENTS_RATING_ENDPOINT = "departments-rating.json";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const OUTER_RADIUS = 60;
  const INNER_RADIUS = 38;
  const STROKE_WIDTH = OUTER_RADIUS - INNER_RADIUS;
  const CIRCUMFERENCE = 2 * Math.PI * ((OUTER_RADIUS + INNER_RADIUS) / 2);

  function createSvgElement(tagName) {
    return document.createElementNS(SVG_NS, tagName);
  }

  function createDonutChart(successPercent) {
    const normalizedSuccess = Math.max(0, Math.min(100, Number(successPercent) || 0));
    const failPercent = 100 - normalizedSuccess;
    const successLength = (CIRCUMFERENCE * normalizedSuccess) / 100;
    const failLength = (CIRCUMFERENCE * failPercent) / 100;

    const svg = createSvgElement("svg");
    svg.classList.add("analytics-donut-chart");
    svg.setAttribute("viewBox", "0 0 140 140");
    svg.setAttribute("aria-label", `Успех ${normalizedSuccess}%`);
    svg.setAttribute("role", "img");

    const group = createSvgElement("g");
    group.setAttribute("transform", "translate(70,70) rotate(-90)");

    const failArc = createSvgElement("circle");
    failArc.setAttribute("r", String((OUTER_RADIUS + INNER_RADIUS) / 2));
    failArc.setAttribute("cx", "0");
    failArc.setAttribute("cy", "0");
    failArc.setAttribute("fill", "none");
    failArc.setAttribute("stroke", "#E97A7A");
    failArc.setAttribute("stroke-width", String(STROKE_WIDTH));
    failArc.setAttribute("stroke-dasharray", `${failLength} ${CIRCUMFERENCE - failLength}`);
    failArc.setAttribute("stroke-linecap", "butt");

    const successArc = createSvgElement("circle");
    successArc.setAttribute("r", String((OUTER_RADIUS + INNER_RADIUS) / 2));
    successArc.setAttribute("cx", "0");
    successArc.setAttribute("cy", "0");
    successArc.setAttribute("fill", "none");
    successArc.setAttribute("stroke", "#7FC8A9");
    successArc.setAttribute("stroke-width", String(STROKE_WIDTH));
    successArc.setAttribute("stroke-dasharray", `${successLength} ${CIRCUMFERENCE - successLength}`);
    successArc.setAttribute("stroke-linecap", "butt");

    group.appendChild(failArc);
    group.appendChild(successArc);
    svg.appendChild(group);

    const centerText = createSvgElement("text");
    centerText.setAttribute("x", "70");
    centerText.setAttribute("y", "76");
    centerText.setAttribute("text-anchor", "middle");
    centerText.setAttribute("class", "analytics-donut-center-text");
    centerText.textContent = `${normalizedSuccess}%`;
    svg.appendChild(centerText);

    return svg;
  }

  function renderDepartmentsRatingCharts(data) {
    const container = document.getElementById("analytics-departments-rating-container");
    if (!container) {
      return;
    }

    const departments = Array.isArray(data?.departments) ? data.departments : [];
    container.innerHTML = "";

    departments.forEach((department) => {
      const card = document.createElement("div");
      card.className = "analytics-department-card";

      const title = document.createElement("div");
      title.className = "analytics-department-title";
      title.textContent = department.name || "";

      const donut = createDonutChart(department.success);

      card.appendChild(title);
      card.appendChild(donut);
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
