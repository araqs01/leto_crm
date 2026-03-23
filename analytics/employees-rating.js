(function (window, document) {
  const EMPLOYEES_RATING_ENDPOINT = "employees-rating.json";

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function createTrophyIcon() {
    const wrapper = createEl("div", "analytics-top1-trophy");
    wrapper.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4h10v2h2a1 1 0 0 1 1 1v2c0 2.97-2.16 5.44-5 5.91V17h2v2H7v-2h2v-2.09C6.16 14.44 4 11.97 4 9V7a1 1 0 0 1 1-1h2V4zm-1 4v1c0 1.86 1.28 3.41 3 3.86V8H6zm12 0h-3v4.86c1.72-.45 3-2 3-3.86V8z" fill="currentColor"/></svg>';
    return wrapper;
  }

  function createAvatar(name) {
    const avatar = createEl("div", "analytics-employee-avatar");
    const initials = (name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
    avatar.textContent = initials || "A";
    return avatar;
  }

  function createTopCard(employee) {
    const rank = Number(employee?.rank) || 0;
    const cardClass =
      rank === 1
        ? "analytics-top-card analytics-top-card-rank1"
        : rank === 2
          ? "analytics-top-card analytics-top-card-rank2"
          : "analytics-top-card analytics-top-card-rank3";
    const card = createEl("div", cardClass);

    if (rank === 1) {
      card.appendChild(createTrophyIcon());
      const counter = createEl("div", "analytics-top1-counter");
      counter.appendChild(createEl("div", "analytics-top1-counter-label", "Сделок (шт)"));
      counter.appendChild(createEl("div", "analytics-top1-counter-value", String(employee.deals ?? 0)));
      card.appendChild(counter);
    }

    const person = createEl("div", "analytics-top-card-person");
    person.appendChild(createAvatar(employee?.name));
    person.appendChild(createEl("div", "analytics-top-card-name", `#${rank} ${employee?.name || ""}`));
    if (employee?.role) {
      person.appendChild(createEl("div", "analytics-top-card-role", employee.role));
    } else {
      person.appendChild(createEl("div", "analytics-top-card-role analytics-top-card-deals", `Сделки: ${employee?.deals ?? 0}`));
    }
    card.appendChild(person);

    return card;
  }

  function createCurrentUserCard(currentUser) {
    const card = createEl("div", "analytics-current-user-card");
    card.appendChild(createEl("div", "analytics-current-user-name", `#${currentUser?.rank ?? ""} ${currentUser?.name || ""}!`));
    card.appendChild(createEl("div", "analytics-current-user-deals", `Сделки: ${currentUser?.deals ?? 0}`));
    return card;
  }

  function createRankingItem(item) {
    return createEl(
      "div",
      "analytics-ranking-item",
      `#${item?.rank ?? ""} ${item?.name || ""} - ${item?.department || ""}`
    );
  }

  function renderEmployeesRating(data) {
    const container = document.getElementById("analytics-employees-rating-container");
    if (!container) return;

    container.innerHTML = "";
    const layout = createEl("div", "analytics-employees-rating-layout-inner");
    const leftCol = createEl("div", "analytics-top3-column");
    const rightCol = createEl("div", "analytics-ranking-list-column");
    const rightList = createEl("div", "analytics-ranking-list");

    const top3 = Array.isArray(data?.top3) ? data.top3 : [];
    const others = Array.isArray(data?.others) ? data.others : [];

    top3.forEach((employee) => leftCol.appendChild(createTopCard(employee)));
    leftCol.appendChild(createCurrentUserCard(data?.currentUser || {}));
    others.forEach((item) => rightList.appendChild(createRankingItem(item)));
    rightCol.appendChild(rightList);

    layout.appendChild(leftCol);
    layout.appendChild(rightCol);
    container.appendChild(layout);
  }

  async function initEmployeesRating(config) {
    const endpoint = config?.endpoint || EMPLOYEES_RATING_ENDPOINT;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to load employees rating data");
    }
    const data = await response.json();
    renderEmployeesRating(data);
  }

  window.initEmployeesRating = initEmployeesRating;
})(window, document);
