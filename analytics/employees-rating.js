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

    const img = document.createElement("img");
    img.src = "/assets/img/bgs/solar_cup-bold.svg";
    img.alt = "trophy";

    wrapper.appendChild(img);
    return wrapper;
  }

  function createAvatar(src) {
    const avatar = createEl("div", "analytics-employee-avatar");

    const img = document.createElement("img");
    img.src = src;

    avatar.appendChild(img);
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

    const person = createEl("div", "analytics-top-card-person");
    const mediaRow = createEl("div", rank === 1 ? "analytics-top1-icons-row" : "analytics-top-icons-row");

    if (rank === 1) {
      mediaRow.appendChild(createTrophyIcon());
    }

    const avatarSrc =
        rank === 1
            ? "/assets/img/bgs/employee_girl.jpg"
            : "/assets/img/bgs/man_employee.jpg";

    mediaRow.appendChild(createAvatar(avatarSrc));
    person.appendChild(mediaRow);

    person.appendChild(
        createEl(
            "div",
            "analytics-top-card-name",
            `#${rank} ${employee?.name || ""}`
        )
    );

    // if (employee?.role) {
    //   person.appendChild(
    //       createEl("div", "analytics-top-card-role", employee.role)
    //   );
    // }

    card.appendChild(person);

    if (rank !== 1) {
      const badge = createEl(
          "div",
          "analytics-top-deals-badge",
          `Сделки: ${employee.deals ?? 0}`
      );

      card.appendChild(badge);
    }

    if (rank === 1) {
      const counter = createEl("div", "analytics-top1-counter");

      counter.appendChild(
          createEl("div", "analytics-top1-counter-label", "Сделок (шт)")
      );

      counter.appendChild(
          createEl(
              "div",
              "analytics-top1-counter-value",
              String(employee.deals ?? 0)
          )
      );

      card.appendChild(counter);
    }

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
    // leftCol.appendChild(createCurrentUserCard(data?.currentUser || {}));
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
