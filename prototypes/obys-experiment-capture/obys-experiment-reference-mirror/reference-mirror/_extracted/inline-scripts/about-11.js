window.addEventListener("DOMContentLoaded", () => {
  const EMAIL = "info@obys.agency";
  const copyButtons = document.querySelectorAll(".copy-email");
  copyButtons.forEach(button => {
    const originalText = button.textContent.trim() || "Contact";
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try { await navigator.clipboard.writeText(EMAIL); }
      catch (err) {
        const tmp = document.createElement("input");
        tmp.value = EMAIL;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = originalText; }, 2000);
    });
  });
});
