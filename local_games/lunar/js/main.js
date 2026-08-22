document.addEventListener("DOMContentLoaded", () => {
  let theme = localStorage.getItem("theme");
  if (!theme) {
    theme = "default";
    localStorage.setItem("theme", theme);
  }
  document.body.setAttribute("theme", theme);

  const prxBackend = localStorage.getItem("proxy-backend");
  if (!prxBackend) {
    localStorage.setItem("proxy-backend", "ultraviolet");
  }

  let blobs = localStorage.getItem("blobs");
  if (!blobs) {
    localStorage.setItem("blobs", "true");
    blobs = "true";
  }
  if (blobs !== "true") {
    const blobsEl = document.getElementById("blobs");
    if (blobsEl) blobsEl.style.display = "none";
  }

  localStorage.setItem("panicUrl", "https://google.com");
  localStorage.setItem("panicKey", "`");

  document.addEventListener("keydown", (e) => {
    if (e.key === localStorage.getItem("panicKey")) {
      window.location.href = localStorage.getItem("panicUrl") || "https://google.com";
    }
  });
});
