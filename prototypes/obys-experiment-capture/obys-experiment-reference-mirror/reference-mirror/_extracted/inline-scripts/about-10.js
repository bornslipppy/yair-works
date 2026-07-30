window.addEventListener("load", () => {
  const timeElement = document.querySelector(".local-time");
  if (!timeElement) return;
  function updateCESTTime() {
    const time = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Warsaw", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date());
    timeElement.textContent = `CEST ${time}`;
  }
  updateCESTTime();
  setInterval(updateCESTTime, 1000);
});
