// kernel.js

// Initialize the topbar when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  setupTopbar();
  showTime();
});

// Set up the topbar with a clock (and other potential items)
function setupTopbar() {
  const topbar = document.createElement("div");
  topbar.id = "topbar";
  topbar.style.position = "absolute";
  topbar.style.left = "0";
  topbar.style.top = "0";
  topbar.style.width = "100%";
  topbar.style.height = "40px";
  topbar.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  topbar.style.color = "white";
  topbar.style.display = "flex";
  topbar.style.justifyContent = "space-between";
  topbar.style.alignItems = "center";
  topbar.style.padding = "0 10px";

  // Add clock
  const clock = document.createElement("div");
  clock.id = "clock";
  clock.style.fontSize = "14px";
  topbar.appendChild(clock);

  document.body.appendChild(topbar);

  // Update time every second
  setInterval(showTime, 1000);
}

// Show the current time in the clock
function showTime() {
  const clock = document.getElementById("clock");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clock.innerHTML = `${hours}:${minutes}:${seconds}`;
}

// Function to create a window (called from window.js)
function createWindow(title, content) {
  const window = new Window(title, content);
}
