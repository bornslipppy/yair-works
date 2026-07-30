window.addEventListener("load", () => {
  if (window.innerWidth <= 1199) return;
  const toggle = document.querySelector(".color-toggle");
  const underline = document.querySelector(".mode-underline");
  const colorText = document.querySelector(".mode-active");
  const calmText = document.querySelector(".mode-inactive");
  const STORAGE_KEY = "obys-color-mode";
  let isCalm = localStorage.getItem(STORAGE_KEY) === "calm";
  function setBackground(color) {
    document.body.style.backgroundColor = color;
    const pw = document.querySelector(".page-wrapper");
    const mf = document.querySelector(".main-frame");
    if (pw) pw.style.backgroundColor = color;
    if (mf) mf.style.backgroundColor = color;
  }
  function moveUnderlineTo(target) {
    if (!underline || !target) return;
    underline.style.left = `${target.offsetLeft}px`;
    underline.style.width = `${target.offsetWidth}px`;
  }
  function applyMode() {
    if (isCalm) {
      moveUnderlineTo(calmText);
      if (window.showPride) window.showPride();
    } else {
      moveUnderlineTo(colorText);
      if (window.hidePride) window.hidePride();
      setBackground("#FFFFFF");
    }
  }
  applyMode();
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    isCalm = !isCalm;
    localStorage.setItem(STORAGE_KEY, isCalm ? "calm" : "color");
    applyMode();
  });
});
