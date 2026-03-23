(function (window, document) {
  const DYNAMICS_ENDPOINT = "dynamics-data.json";
  let showTrend = false;
  let cachedDynamicsData = null;

  function formatNumberWithSign(num) {
    const abs = Math.abs(num);
    const formatted = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return num >= 0 ? "+" + formatted : "-" + formatted;
  }

  function formatNumberPlain(num) {
    const formatted = String(Math.abs(num)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return num < 0 ? "-" + formatted : formatted;
  }

  function renderValue(cell, value) {
    if (value === undefined || value === null) {
      return;
    }

    if (!showTrend) {
      cell.textContent = formatNumberPlain(value);
      return;
    }

    const valueWrap = document.createElement("span");
    valueWrap.className = "analytics-dynamics-value";
    valueWrap.classList.add(value >= 0 ? "is-positive" : "is-negative");

    const amount = document.createElement("span");
    amount.textContent = formatNumberWithSign(value);

    const arrow = document.createElement("span");
    arrow.className = "analytics-dynamics-arrow";
    arrow.textContent = value >= 0 ? "▲" : "▼";

    valueWrap.appendChild(amount);
    valueWrap.appendChild(arrow);
    cell.appendChild(valueWrap);
  }

  function renderDynamicsTable(data) {
    const container = document.getElementById("analytics-chart-container");
    if (!container) return;

    const columns = Array.isArray(data?.columns) ? data.columns : [];
    const rows = Array.isArray(data?.rows) ? data.rows : [];

    if (columns.length === 0) {
      container.innerHTML = "";
      return;
    }

    const dateColumns = columns.slice(2);

    const table = document.createElement("table");
    table.className = "analytics-dynamics-table";
    table.setAttribute("role", "grid");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach((col, idx) => {
      const th = document.createElement("th");
      th.className = "analytics-dynamics-th";
      if (idx < 2) {
        th.classList.add("analytics-dynamics-sticky");
      }
      th.textContent = col;
      th.setAttribute("scope", "col");
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className = "analytics-dynamics-tr";

      const nameCell = document.createElement("td");
      nameCell.className = "analytics-dynamics-td analytics-dynamics-sticky";
      nameCell.textContent = row.name || "";
      tr.appendChild(nameCell);

      const totalCell = document.createElement("td");
      totalCell.className = "analytics-dynamics-td analytics-dynamics-sticky analytics-dynamics-total";
      const totalVal = row.total;
      renderValue(totalCell, totalVal);
      tr.appendChild(totalCell);

      dateColumns.forEach((dateKey) => {
        const td = document.createElement("td");
        td.className = "analytics-dynamics-td analytics-dynamics-date";
        const val = row.values?.[dateKey];
        renderValue(td, val);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "analytics-dynamics-scroll";
    scrollWrapper.appendChild(table);

    container.innerHTML = "";
    container.appendChild(scrollWrapper);
  }

  async function initDynamicsTable(config) {
    const endpoint = config?.endpoint || DYNAMICS_ENDPOINT;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to load dynamics data");
      const data = await response.json();
      cachedDynamicsData = data;
      renderDynamicsTable(cachedDynamicsData);
    } catch (err) {
      console.error("Dynamics table initialization failed:", err);
      const container = document.getElementById("analytics-chart-container");
      if (container) {
        container.innerHTML = "";
      }
    }
  }

  function rerenderDynamicsTable() {
    if (cachedDynamicsData) {
      renderDynamicsTable(cachedDynamicsData);
    }
  }

  function setDynamicsTrendMode(nextValue) {
    showTrend = Boolean(nextValue);
    rerenderDynamicsTable();
  }

  window.renderDynamicsTable = renderDynamicsTable;
  window.initDynamicsTable = initDynamicsTable;
  window.rerenderDynamicsTable = rerenderDynamicsTable;
  window.setDynamicsTrendMode = setDynamicsTrendMode;
})(window, document);
