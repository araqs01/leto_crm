(function (window, document) {
  const DEFAULT_FILTERS_ENDPOINT = "filters.json";

  const analyticsFiltersState = {
    source: DEFAULT_FILTERS_ENDPOINT,
    options: {
      departments: [],
      quarters: [],
      years: []
    },
    selected: {
      departmentId: "",
      quarter: "",
      year: ""
    },
    isLoaded: false
  };

  function getFilterElements() {
    return {
      departmentSelect: document.getElementById("departmentSelect"),
      quarterSelect: document.getElementById("quarterSelect"),
      yearSelect: document.getElementById("yearSelect")
    };
  }

  function createPlaceholderOption(label) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = label;
    option.disabled = true;
    option.selected = true;
    option.hidden = true;
    return option;
  }

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = label;
    return option;
  }

  function populateSelect(selectElement, options, placeholderLabel) {
    if (!selectElement) {
      return;
    }

    selectElement.innerHTML = "";
    selectElement.appendChild(createPlaceholderOption(placeholderLabel));
    options.forEach((option) => {
      selectElement.appendChild(createOption(option.value, option.label));
    });
  }

  function updateSelectionState(elements) {
    analyticsFiltersState.selected.departmentId = elements.departmentSelect?.value ?? "";
    analyticsFiltersState.selected.quarter = elements.quarterSelect?.value ?? "";
    analyticsFiltersState.selected.year = elements.yearSelect?.value ?? "";
  }

  function renderAnalyticsChartContainer() {
    const chartContainer = document.getElementById("analytics-chart-container");
    if (!chartContainer) {
      return;
    }

    chartContainer.dataset.filtersState = JSON.stringify(analyticsFiltersState.selected);
    chartContainer.dataset.filtersLoaded = String(analyticsFiltersState.isLoaded);
  }

  function attachSelectionListeners(elements) {
    const onSelectionChange = () => {
      updateSelectionState(elements);
      renderAnalyticsChartContainer();
    };

    elements.departmentSelect?.addEventListener("change", onSelectionChange);
    elements.quarterSelect?.addEventListener("change", onSelectionChange);
    elements.yearSelect?.addEventListener("change", onSelectionChange);
  }

  function normalizePayload(payload) {
    return {
      departments: Array.isArray(payload?.departments) ? payload.departments : [],
      quarters: Array.isArray(payload?.quarters) ? payload.quarters : [],
      years: Array.isArray(payload?.years) ? payload.years : []
    };
  }

  async function fetchFilters(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("Failed to load filters");
    }

    return response.json();
  }

  async function initAnalyticsFilters(config) {
    const endpoint = config?.endpoint || DEFAULT_FILTERS_ENDPOINT;
    const elements = getFilterElements();

    try {
      const payload = normalizePayload(await fetchFilters(endpoint));

      analyticsFiltersState.source = endpoint;
      analyticsFiltersState.options.departments = payload.departments;
      analyticsFiltersState.options.quarters = payload.quarters;
      analyticsFiltersState.options.years = payload.years;

      populateSelect(
        elements.departmentSelect,
        payload.departments.map((department) => ({
          value: department.id,
          label: department.name
        })),
        "Отдел"
      );
      populateSelect(
        elements.quarterSelect,
        payload.quarters.map((quarter) => ({
          value: quarter,
          label: `Q${quarter}`
        })),
        "Квартал"
      );
      populateSelect(
        elements.yearSelect,
        payload.years.map((year) => ({
          value: year,
          label: String(year)
        })),
        "Год"
      );

      updateSelectionState(elements);
      analyticsFiltersState.isLoaded = true;
      renderAnalyticsChartContainer();
      attachSelectionListeners(elements);
    } catch (error) {
      analyticsFiltersState.isLoaded = false;
      renderAnalyticsChartContainer();
      console.error("Analytics filters initialization failed:", error);
    }

    return analyticsFiltersState;
  }

  window.analyticsFiltersState = analyticsFiltersState;
  window.initAnalyticsFilters = initAnalyticsFilters;
})(window, document);
