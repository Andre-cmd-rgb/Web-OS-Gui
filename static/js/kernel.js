// kernel.js

// Initialize the taskbar and topbar when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  setupTaskbar();
  setupTopbar();
  showTime();
});

// Set up the taskbar and topbar
function setupTaskbar() {
  const taskbar = document.createElement("div");
  taskbar.id = "taskbar";
  taskbar.style.position = "absolute";
  taskbar.style.left = "0";
  taskbar.style.bottom = "0";
  taskbar.style.width = "100%";
  taskbar.style.height = "50px";
  taskbar.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  taskbar.style.display = "flex";
  taskbar.style.justifyContent = "space-between";
  taskbar.style.alignItems = "center";
  taskbar.style.padding = "0 10px";
  taskbar.style.borderTopLeftRadius = "15px";
  taskbar.style.borderTopRightRadius = "15px";

  // Add application launcher (example)
  const appLauncher = document.createElement("div");
  appLauncher.style.color = "white";
  appLauncher.innerHTML = "<strong>App Launcher</strong>";
  taskbar.appendChild(appLauncher);

  // Add window buttons (these can be dynamically added based on opened windows)
  const windowButtons = document.createElement("div");
  windowButtons.id = "window-buttons";
  taskbar.appendChild(windowButtons);

  document.body.appendChild(taskbar);
}

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
