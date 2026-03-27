const API_BASE_URL = "https://leto.strio.ru";
const API_PATH = "/api/v1/tv";
const API_BASE_OVERRIDE = window.TV_API_BASE_URL || "";
const TV_ENDPOINT = `${API_BASE_OVERRIDE || API_BASE_URL}${API_PATH}`;
const TV_MOCK_JSON_PATH = "./tv.json";
const USE_TV_MOCK = false;
const DEFAULT_MALE_AVATAR = "/upload/employers/no-photo-boy.jpg";
const DEFAULT_FEMALE_AVATAR = "/upload/employers/no-photo-girl.jpg";

function getFullName(employee) {
  return `${employee.surname || ""} ${employee.name || ""}`.trim();
}

function isLikelyFemale(employee) {
  const patronymic = (employee.patronymic || "").toLowerCase();
  const name = (employee.name || "").toLowerCase();

  if (patronymic.endsWith("на")) return true;
  if (patronymic.endsWith("ич")) return false;

  return name.endsWith("а") || name.endsWith("я");
}

function getAvatarUrl(employee) {
  const fallbackPath = isLikelyFemale(employee) ? DEFAULT_FEMALE_AVATAR : DEFAULT_MALE_AVATAR;
  const avatarPath = employee.avatar || fallbackPath;

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  return `${API_BASE_URL}${avatarPath}`;
}

function renderTopThree(data) {
  const top3Root = document.getElementById("brokersTop3");
  if (!top3Root) return;

  const topThree = data
    .filter((employee) => employee.rank >= 1 && employee.rank <= 3)
    .sort((a, b) => a.rank - b.rank);

  top3Root.innerHTML = topThree
    .map((employee) => {
      const fullName = getFullName(employee);
      const safeDelta = Number(employee.delta || 0);
      const deltaPrefix = safeDelta > 0 ? "+" : "";

      return `
        <article class="brokers-card brokers-card-${employee.rank} ${employee.colorClass || ""}">
          <img class="brokers-avatar" src="${getAvatarUrl(employee)}" alt="${fullName}" />
          <div class="brokers-meta">
            <div class="brokers-rank">${employee.rank}</div>
            <div class="brokers-sep"></div>
            <h2 class="brokers-name">${fullName}</h2>
          </div>
          <div class="brokers-badges">
            <span class="brokers-badge"><span class="brokers-badge-text">${employee.deals || 0} сделок</span></span>
            <span class="brokers-badge brokers-badge-up">
              <span class="brokers-up">${deltaPrefix}${safeDelta}</span>
              <svg class="brokers-up-icon" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
                <path d="M22 6 L36 30 Q37 32 35 34 L9 34 Q7 32 8 30 Z"></path>
              </svg>
              <span class="brokers-badge-text">Мест за месяц</span>
            </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function topTenItemTemplate(employee) {
  const trendByDelta = Number(employee.delta || 0) < 0 ? "down" : "up";
  const trend = employee.trend || trendByDelta;
  const trendClass = trend === "down" ? "brokers-trend down" : "brokers-trend";
  const rankClass = employee.rank === 10 ? "brokers-item-rank brokers-item-rank10" : "brokers-item-rank";
  const sepClass = employee.rank === 10 ? "brokers-item-sep brokers-item-sep-rank10" : "brokers-item-sep";
  const trendShiftClass =
    employee.rank === 10 ? `brokers-trend brokers-trend-rank10${trend === "down" ? " down" : ""}` : trendClass;
  const fullName = getFullName(employee);
  const [surname = "", name = ""] = fullName.split(" ");

  return `
    <div class="brokers-item">
      <div class="${trendShiftClass}" aria-hidden="true">
        <svg class="brokers-trend-icon" viewBox="0 0 44 44" focusable="false">
          <path d="M22 6 L36 30 Q37 32 35 34 L9 34 Q7 32 8 30 Z"></path>
        </svg>
      </div>
      <div class="${rankClass}">${employee.rank}</div>
      <div class="${sepClass}"></div>
      <div class="brokers-item-avatar" style="background-image: url('${getAvatarUrl(employee)}'); background-size: cover; background-position: center;" aria-hidden="true"></div>
      <p class="brokers-item-name">${surname}<br>${name}</p>
    </div>
  `;
}

function renderTopTen(data) {
  const root = document.getElementById("brokersTop10");
  if (!root) return;

  const topTen = data
    .filter((employee) => employee.rank >= 4 && employee.rank <= 10)
    .sort((a, b) => a.rank - b.rank);

  const rank4 = topTen.find((employee) => employee.rank === 4);
  const middle = topTen.filter((employee) => employee.rank >= 5 && employee.rank <= 7);
  const right = topTen.filter((employee) => employee.rank >= 8 && employee.rank <= 10);

  root.style.display = "grid";
  root.innerHTML = `
    <div class="brokers-col brokers-col-rank4">${rank4 ? topTenItemTemplate(rank4) : ""}</div>
    <div class="brokers-col">${middle.map(topTenItemTemplate).join("")}</div>
    <div class="brokers-col">${right.map(topTenItemTemplate).join("")}</div>
  `;
}

function renderOtherEmployees(data) {
  const listLeft = document.getElementById("brokersListLeft");
  const listRight = document.getElementById("brokersListRight");

  if (!listLeft || !listRight) return;

  const others = data
    .filter((employee) => employee.rank >= 11)
    .sort((a, b) => a.rank - b.rank);

  const rows = others
    .map((employee) => {
      const fullName = getFullName(employee);
      const deltaValue = Number(employee.delta || 0);
      const deltaClass = deltaValue > 0 ? "brokers-list-up" : deltaValue < 0 ? "brokers-list-down" : "brokers-list-neutral";
      const trendArrow = employee.trend === "down" ? "▼" : "▲";
      const deltaPrefix = deltaValue > 0 ? "+" : "";

      return `
        <div class="brokers-list-row">
          <span>${employee.rank}. ${fullName}</span>
          <span class="${deltaClass}">${deltaPrefix}${deltaValue} ${trendArrow}</span>
        </div>
      `;
    });

  const half = Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, half).join("");
  const rightRows = rows.slice(half).join("");

  listLeft.innerHTML = leftRows;
  listRight.innerHTML = rightRows;
}

function renderTvRating(data) {
  const top3Root = document.getElementById("brokersTop3");
  const listLeft = document.getElementById("brokersListLeft");
  const listRight = document.getElementById("brokersListRight");

  if (top3Root) top3Root.innerHTML = "";
  if (listLeft) listLeft.innerHTML = "";
  if (listRight) listRight.innerHTML = "";

  renderTopThree(data);
  renderTopTen(data);
  renderOtherEmployees(data);
}

async function loadTvRating() {
  try {
    const primarySourceUrl = USE_TV_MOCK ? TV_MOCK_JSON_PATH : TV_ENDPOINT;

    let response = await fetch(primarySourceUrl, { credentials: "include" });

    if (!response.ok && !USE_TV_MOCK) {
      throw new Error(`TV endpoint returned ${response.status}`);
    }

    if (!response.ok && USE_TV_MOCK) {
      throw new Error(`TV mock returned ${response.status}`);
    }

    let contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Unexpected response type: ${contentType || "unknown"}`);
    }

    let json = await response.json();

    // Если endpoint не отдал валидные данные, пробуем fallback в mock.
    if ((!json || json.error !== 200 || !Array.isArray(json.tv)) && !USE_TV_MOCK) {
      response = await fetch(TV_MOCK_JSON_PATH, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`TV mock fallback returned ${response.status}`);
      }
      contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Unexpected fallback response type: ${contentType || "unknown"}`);
      }
      json = await response.json();
    }

    if (json.error !== 200 || !Array.isArray(json.tv)) return;
    renderTvRating(json.tv);
  } catch (error) {
    if (!USE_TV_MOCK) {
      try {
        const fallbackResponse = await fetch(TV_MOCK_JSON_PATH, { credentials: "include" });
        if (fallbackResponse.ok) {
          const fallbackJson = await fallbackResponse.json();
          if (fallbackJson.error === 200 && Array.isArray(fallbackJson.tv)) {
            renderTvRating(fallbackJson.tv);
            console.warn("TV endpoint unavailable, rendered fallback tv.json");
            return;
          }
        }
      } catch (fallbackError) {
        console.error("TV fallback load error:", fallbackError);
      }
    }

    console.error("TV rating load error:", error);
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      console.warn(
        "Endpoint blocked by CORS/cookies from localhost. Use dev proxy or run on leto.strio.ru domain."
      );
    }
  }
}

// Первая загрузка и периодическое обновление данных каждые 30 секунд.
loadTvRating();
// setInterval(loadTvRating, 30000);
