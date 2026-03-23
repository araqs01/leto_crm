const actionBtn = document.getElementById("action-btn");
const message = document.getElementById("message");

actionBtn.addEventListener("click", () => {
  const now = new Date().toLocaleTimeString();
  message.textContent = `Button clicked at ${now}`;
});
