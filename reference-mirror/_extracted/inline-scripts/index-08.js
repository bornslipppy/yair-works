window.addEventListener("DOMContentLoaded", () => {
  const EMAIL = "info@obys.agency";
  const copyButtons = document.querySelectorAll(".copy-email");
  copyButtons.forEach((button) => {
    const originalText = button.textContent.trim() || "Contact";
    button.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(EMAIL);
      } catch (err) {
        const tempInput = document.createElement("input");
        tempInput.value = EMAIL;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = originalText; }, 2000);
    });
  });
});
