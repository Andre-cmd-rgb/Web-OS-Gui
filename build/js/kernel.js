// kernel.js

document.addEventListener("DOMContentLoaded", function() {
  setupTopbar();
  showTime();
  const notificationManager = new NotificationManager();

  new Window("My App", "Welcome to the app!", "app-icons/app.png");
  new Window("Terminal", "apps/terminal.html", "app-icons/terminal.png", {
    width: 1000,
    height: 600,
    left: 1000,
    top: 500,
    minWidth: 400,
    minHeight: 300,
    isExternal: true,
  });
  
  new Window("Calculator", "apps/calc.html", "app-icons/calculator.png", {
    width: 350,
    height: 480,
    left: 150,
    top: 500,
    resizable: false,
    isExternal: true,
});


const backgroundAppContent = `
<div class="background-app">
  <h3>Select a Background</h3>
  <div class="background-list" style="display: flex; flex-wrap: wrap; padding: 10px;"></div>
</div>
`;

new Window("Change Background", backgroundAppContent, "app-icons/theme.png", {
width: 420,
height: 360,
left: 800,
top: 150,
minWidth: 420,
minHeight: 360,
});


function changeBackground(imagePath) {
const desktop = document.getElementById("desktop");
if (desktop) {
  desktop.style.backgroundImage = `url('${imagePath}')`;
  localStorage.setItem("currentWallpaper", imagePath);
}
}


function loadWallpapers(numWallpapers) {
const backgroundListDiv = document.querySelector('.background-list');

function loadWallpaperRecursively(index) {
  if (index > numWallpapers) return;

  const wallpaper = `wallpaper-${index}.png`;
  const previewImage = document.createElement("img");
  previewImage.src = `wallpapers/${wallpaper}`;
  previewImage.alt = wallpaper;
  previewImage.style.width = '100px';
  previewImage.style.height = 'auto';
  previewImage.style.margin = '10px';
  previewImage.onclick = () => changeBackground(`wallpapers/${wallpaper}`);
  backgroundListDiv.appendChild(previewImage);

  loadWallpaperRecursively(index + 1);
}

loadWallpaperRecursively(1);
}

loadWallpapers(9);

function loadSavedWallpaper() {
const savedWallpaper = localStorage.getItem("currentWallpaper");
if (savedWallpaper) {
  changeBackground(savedWallpaper);
} else {
  changeBackground("wallpapers/wallpaper-2.png");
}
}

loadSavedWallpaper();
new Window("Web Edit", "apps/editor.html", "app-icons/editor.png", {
  width: 420,
  height: 480,
  left: 600,
  top: 100,
  minWidth: 420,
  minHeight: 480,
  isExternal: true,
});

});

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

  // clock
  const clock = document.createElement("div");
  clock.id = "clock";
  clock.style.fontSize = "14px";
  topbar.appendChild(clock);

  document.body.appendChild(topbar);
  setInterval(showTime, 1000);
}

// time in the clock
function showTime() {
  const clock = document.getElementById("clock");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  clock.innerHTML = `${hours}:${minutes}:${seconds}`;
}

function createWindow(title, content) {
  const window = new Window(title, content);
}
