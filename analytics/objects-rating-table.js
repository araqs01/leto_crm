(function (window, document) {
  const OBJECTS_RATING_ENDPOINT = "objects-rating.json";

  function renderObjectsRatingTable(data) {
    const container = document.getElementById("analytics-objects-rating-container");
    if (!container) return;

    const objects = Array.isArray(data?.objects) ? data.objects : [];

    const scrollWrapper = document.createElement("div");
    scrollWrapper.className = "analytics-objects-table-scroll";

    const table = document.createElement("table");
    table.className = "analytics-objects-table";
    table.setAttribute("role", "grid");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["№", "Наименование объекта", "Количество сделок"];
    headers.forEach((text, idx) => {
      const th = document.createElement("th");
      th.className = idx === 0 ? "col-rank" : idx === 1 ? "col-name" : "col-deals";
      th.textContent = text;
      th.setAttribute("scope", "col");
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    objects.forEach((obj) => {
      const tr = document.createElement("tr");
      const rankCell = document.createElement("td");
      rankCell.className = "col-rank";
      rankCell.textContent = obj.rank ?? "";
      const nameCell = document.createElement("td");
      nameCell.className = "col-name";
      nameCell.textContent = obj.name ?? "";
      const dealsCell = document.createElement("td");
      dealsCell.className = "col-deals";
      dealsCell.textContent = obj.deals ?? "";
      tr.appendChild(rankCell);
      tr.appendChild(nameCell);
      tr.appendChild(dealsCell);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    scrollWrapper.appendChild(table);
    container.innerHTML = "";
    container.appendChild(scrollWrapper);
  }

  async function initObjectsRatingTable(config) {
    const endpoint = config?.endpoint || OBJECTS_RATING_ENDPOINT;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to load objects rating data");
      const data = await response.json();
      renderObjectsRatingTable(data);
    } catch (err) {
      console.error("Objects rating table initialization failed:", err);
      const container = document.getElementById("analytics-objects-rating-container");
      if (container) {
        container.innerHTML = "";
      }
    }
  }

  window.initObjectsRatingTable = initObjectsRatingTable;
})(window, document);
