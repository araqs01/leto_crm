const tabs = document.querySelectorAll(".analytics-tab");
const panels = document.querySelectorAll(".analytics-tab-panel");
const analyticsWrapper = document.querySelector(".analytics-wrapper");

const titleMap = {
  "Динамика работы отделов": "Динамика работы",
  "Рейтинг отделов": "Рейтинг отделов",
  "Рейтинг сотрудников": "Рейтинг сотрудников",
  "Рейтинг объектов": "Рейтинг объектов"
};
let chartsInitialized = false;
let employeesRatingInitialized = false;
let objectsRatingInitialized = false;

function switchTab(targetId) {
  const activeTab = Array.from(tabs).find((tab) => tab.dataset.tab === targetId);
  const tabLabel = activeTab ? activeTab.textContent.trim() : "";
  const titleText = titleMap[tabLabel] ?? tabLabel;

  const titleEl = document.querySelector(".analytics-title");
  if (titleEl) {
    titleEl.textContent = titleText;
  }

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === targetId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.content === targetId;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  if (typeof closeFloatingFilter === "function") {
    closeFloatingFilter();
  }

  if (targetId === "departments-dynamics" && typeof window.initDynamicsTable === "function") {
    window.initDynamicsTable({ endpoint: "dynamics-data.json" });
  }

  if (
    targetId === "departments-rating" &&
    !chartsInitialized &&
    typeof window.initDepartmentsRatingCharts === "function"
  ) {
    window
      .initDepartmentsRatingCharts({ endpoint: "departments-rating.json" })
      .then(() => {
        chartsInitialized = true;
      })
      .catch((error) => {
        console.error("Departments rating charts initialization failed:", error);
      });
  }

  if (
    targetId === "employees-rating" &&
    !employeesRatingInitialized &&
    typeof window.initEmployeesRating === "function"
  ) {
    window
      .initEmployeesRating({ endpoint: "employees-rating.json" })
      .then(() => {
        employeesRatingInitialized = true;
      })
      .catch((error) => {
        console.error("Employees rating initialization failed:", error);
      });
  }

  if (
    targetId === "objects-rating" &&
    !objectsRatingInitialized &&
    typeof window.initObjectsRatingTable === "function"
  ) {
    window
      .initObjectsRatingTable({ endpoint: "objects-rating.json" })
      .then(() => {
        objectsRatingInitialized = true;
      })
      .catch((error) => {
        console.error("Objects rating table initialization failed:", error);
      });
  }

  updateHeaderFilterVisibility(targetId);

  if (analyticsWrapper) {
    analyticsWrapper.dataset.activeTab = targetId;
  }
}

function updateHeaderFilterVisibility(activeTab) {
  const departmentSelect = document.getElementById("departmentSelect");
  const quarterSelect = document.getElementById("quarterSelect");
  const yearSelect = document.getElementById("yearSelect");
  const dateFromSelect = document.getElementById("dateFromSelect");
  const dateToSelect = document.getElementById("dateToSelect");

  if (activeTab === "objects-rating") {
    departmentSelect?.classList.add("is-hidden");
    quarterSelect?.classList.add("is-hidden");
    yearSelect?.classList.add("is-hidden");
    dateFromSelect?.classList.remove("is-hidden");
    dateToSelect?.classList.remove("is-hidden");
  } else {
    departmentSelect?.classList.remove("is-hidden");
    quarterSelect?.classList.remove("is-hidden");
    yearSelect?.classList.remove("is-hidden");
    dateFromSelect?.classList.add("is-hidden");
    dateToSelect?.classList.add("is-hidden");
  }
}

function bindTabEvents() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });
}

const TAB_PANEL_MAP = {
  "departments-dynamics": "departments-dynamics",
  "departments-rating": "departments-rating",
  "objects-rating": "objects-rating"
};

const FLOATING_FILTER_MOCK = {
  employees: ["Иванов", "Петров", "Сидоров"],
  types: ["Продажи", "Аренда", "Новостройки"],
  quarters: [1, 2, 3, 4],
  years: [2023, 2024, 2025]
};

const DATE_RANGE_MOCK = ["01.01.2025", "01.02.2025", "01.03.2025"];

function getActiveTabId() {
  const activeTab = document.querySelector(".analytics-tab.is-active");
  return activeTab ? activeTab.dataset.tab || "" : "";
}

function populateFloatingSelect(selectEl, items) {
  if (!selectEl) return;
  const placeholder = selectEl.querySelector("option[disabled][selected][hidden]");
  if (!placeholder) return;
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    placeholder.after(opt);
  });
}

function closeFloatingFilter() {
  const floatingFilter = document.getElementById("analyticsFloatingFilter");
  if (floatingFilter) {
    floatingFilter.classList.remove("is-open");
    floatingFilter.removeAttribute("data-active-panel");
  }
}

function openFloatingFilter() {
  const floatingFilter = document.getElementById("analyticsFloatingFilter");
  const activeTabId = getActiveTabId();
  const panelId = TAB_PANEL_MAP[activeTabId];

  if (!floatingFilter || !panelId) return;

  floatingFilter.dataset.activePanel = panelId;
  floatingFilter.classList.add("is-open");
}

function initFloatingFilterPanel() {
  const filterIcon = document.querySelector(".analytics-filter-icon");
  const floatingFilter = document.getElementById("analyticsFloatingFilter");
  const dynamicsPanel = floatingFilter?.querySelector(".analytics-filter-panel-dynamics");
  const employeeSelect = document.getElementById("analyticsFloatingEmployee");
  const typeSelect = document.getElementById("analyticsFloatingType");
  const typeSelectRating = document.getElementById("analyticsFloatingTypeRating");
  const quarterSelectObjects = document.getElementById("analyticsFloatingQuarterObjects");
  const yearSelectObjects = document.getElementById("analyticsFloatingYearObjects");
  const trendToggle = dynamicsPanel?.querySelector('.analytics-floating-toggle input[type="checkbox"]');

  if (!filterIcon || !floatingFilter) return;

  populateFloatingSelect(employeeSelect, FLOATING_FILTER_MOCK.employees);
  populateFloatingSelect(typeSelect, FLOATING_FILTER_MOCK.types);
  populateFloatingSelect(typeSelectRating, FLOATING_FILTER_MOCK.types);
  populateFloatingSelect(quarterSelectObjects, FLOATING_FILTER_MOCK.quarters.map((q) => `Q${q}`));
  populateFloatingSelect(yearSelectObjects, FLOATING_FILTER_MOCK.years.map((y) => String(y)));

  const dateFromSelect = document.getElementById("dateFromSelect");
  const dateToSelect = document.getElementById("dateToSelect");
  populateFloatingSelect(dateFromSelect, DATE_RANGE_MOCK);
  populateFloatingSelect(dateToSelect, DATE_RANGE_MOCK);

  if (trendToggle && typeof window.setDynamicsTrendMode === "function") {
    window.setDynamicsTrendMode(trendToggle.checked);
    trendToggle.addEventListener("change", () => {
      window.setDynamicsTrendMode(trendToggle.checked);
    });
  }

  filterIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    if (floatingFilter.classList.contains("is-open")) {
      closeFloatingFilter();
    } else {
      openFloatingFilter();
    }
  });

  floatingFilter.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    closeFloatingFilter();
  });
}

async function initAnalyticsPage() {
  bindTabEvents();
  switchTab("departments-dynamics");
  initFloatingFilterPanel();

  if (typeof window.initAnalyticsFilters === "function") {
    await window.initAnalyticsFilters({
      endpoint: "filters.json"
    });
  } else {
    console.error("initAnalyticsFilters is not available");
  }
}

initAnalyticsPage();
