const imgEllipse9 = "https://www.figma.com/api/mcp/asset/af0d8f5a-67e8-4056-bc1a-5221a547cf62";
const imgEllipse10 = "https://www.figma.com/api/mcp/asset/d646bacd-b863-44c7-9816-bb6901e974b0";
const imgEllipse11 = "https://www.figma.com/api/mcp/asset/bcea11f6-33ba-4cb1-9d17-357d016741e9";
const imgVector10 = "https://www.figma.com/api/mcp/asset/c0b7a12e-6571-4d94-9451-e71562d990dc";

const top3 = [
  { rank: 1, first: "Алёна", last: "Тимошенко", deals: 48, delta: 12, colorClass: "rank-gold", avatar: imgEllipse9 },
  { rank: 2, first: "Андрей", last: "Ершов", deals: 48, delta: 12, colorClass: "rank-silver", avatar: imgEllipse10 },
  { rank: 3, first: "Виктория", last: "Брошикова", deals: 48, delta: 12, colorClass: "rank-bronze", avatar: imgEllipse11 }
];

const top10 = [
  { rank: 4, first: "Андрей", last: "Ершов", trend: "up" },
  { rank: 5, first: "Юлия", last: "Голышманова", trend: "up" },
  { rank: 6, first: "Юлия", last: "Голышманова", trend: "up" },
  { rank: 7, first: "Юлия", last: "Голышманова", trend: "up" },
  { rank: 8, first: "Юлия", last: "Голышманова", trend: "up" },
  { rank: 9, first: "Юлия", last: "Голышманова", trend: "down" },
  { rank: 10, first: "Юлия", last: "Голышманова", trend: "up" }
];

function rowTemplate(index) {
  return `
    <div class="brokers-list-row">
      <span>${index} Володя Ермолин</span>
      <span class="brokers-list-up">+5 ▲</span>
    </div>
  `;
}

function initTop3() {
  const top3Root = document.getElementById("brokersTop3");
  if (!top3Root) return;

  top3Root.innerHTML = top3
    .map(
      (item) => `
        <article class="brokers-card brokers-card-${item.rank} ${item.colorClass}">
          <img class="brokers-avatar" src="${item.avatar}" alt="${item.last} ${item.first}" />
          <div class="brokers-meta">
            <div class="brokers-rank">${item.rank}</div>
            <div class="brokers-sep"></div>
            <h2 class="brokers-name">${item.last}<br>${item.first}</h2>
          </div>
          <div class="brokers-badges">
            <span class="brokers-badge"><span class="brokers-badge-text">${item.deals} сделок</span></span>
            <span class="brokers-badge brokers-badge-up">
              <span class="brokers-up">+${item.delta}</span>
              <img class="brokers-up-icon" src="${imgVector10}" alt="" />
              <span class="brokers-badge-text">Мест за месяц</span>
            </span>
          </div>
        </article>
      `
    )
    .join("");
}

function itemTemplate(item) {
  const trendClass = item.trend === "down" ? "brokers-trend down" : "brokers-trend";
  const rankClass = item.rank === 10 ? "brokers-item-rank brokers-item-rank10" : "brokers-item-rank";
  const sepClass = item.rank === 10 ? "brokers-item-sep brokers-item-sep-rank10" : "brokers-item-sep";
  const trendShiftClass = item.rank === 10 ? "brokers-trend brokers-trend-rank10" + (item.trend === "down" ? " down" : "") : trendClass;
  return `
    <div class="brokers-item">
      <div class="${trendShiftClass}" aria-hidden="true">
        <svg class="brokers-trend-icon" viewBox="0 0 44 44" focusable="false">
          <path d="M22 6 L36 30 Q37 32 35 34 L9 34 Q7 32 8 30 Z"></path>
        </svg>
      </div>
      <div class="${rankClass}">${item.rank}</div>
      <div class="${sepClass}"></div>
      <div class="brokers-item-avatar" aria-hidden="true"></div>
      <p class="brokers-item-name">${item.last}<br>${item.first}</p>
    </div>
  `;
}

function initTop10() {
  const root = document.getElementById("brokersTop10");
  if (!root) return;
  const rank4 = top10.find((item) => item.rank === 4);
  const middle = top10.filter((item) => item.rank >= 5 && item.rank <= 7);
  const right = top10.filter((item) => item.rank >= 8 && item.rank <= 10);

  root.innerHTML = `
    <div class="brokers-col brokers-col-rank4">${rank4 ? itemTemplate(rank4) : ""}</div>
    <div class="brokers-col">${middle.map(itemTemplate).join("")}</div>
    <div class="brokers-col">${right.map(itemTemplate).join("")}</div>
  `;
}

function initList() {
  const left = document.getElementById("brokersListLeft");
  const right = document.getElementById("brokersListRight");
  if (!left || !right) return;

  const leftRows = Array.from({ length: 24 }, (_, i) => rowTemplate(i + 4)).join("");
  const rightRows = Array.from({ length: 24 }, (_, i) => rowTemplate(i + 4)).join("");
  left.innerHTML = leftRows;
  right.innerHTML = rightRows;
}

initTop3();
initTop10();
initList();
