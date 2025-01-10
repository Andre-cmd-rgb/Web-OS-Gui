// Define the Window class
class Window {
    constructor(title, content, iconPath = "app-icons/app.png", options = {}) {
      this.title = title;
      this.content = content;
      this.iconPath = iconPath;
      this.isMinimized = false;
      this.taskbarItem = null;
  
      // Default options with user overrides
      this.options = {
        width: options.width || 300,
        height: options.height || 200,
        left: options.left || 100,
        top: options.top || 100,
        resizable: options.resizable !== false,
        draggable: options.draggable !== false,
        isExternal: options.isExternal || false,
      };
  
      this.createWindow();
    }
  
    createWindow() {
      const desktop = document.getElementById("desktop");
      if (!desktop) {
        console.error("Desktop container not found");
        return;
      }
  
      const windowDiv = document.createElement("div");
      windowDiv.classList.add("window");
      windowDiv.id = `window-${this.title}`;
      windowDiv.style.position = "absolute";
      windowDiv.style.left = `${this.options.left}px`;
      windowDiv.style.top = `${this.options.top}px`;
      windowDiv.style.width = `${this.options.width}px`;
      windowDiv.style.height = `${this.options.height}px`;
  
      // Window header
      const header = document.createElement("div");
      header.classList.add("window-header");
      header.innerHTML = `
        <span>${this.title}</span>
        <div class="window-btns">
          <button class="window-btn close"></button>
          <button class="window-btn maximize"></button>
          <button class="window-btn minimize"></button>
        </div>
      `;
  
      header.querySelector(".close").addEventListener("click", () => this.closeWindow(windowDiv));
      header.querySelector(".maximize").addEventListener("click", () => this.toggleMaximize(windowDiv));
      header.querySelector(".minimize").addEventListener("click", () => this.minimizeWindow(windowDiv));
  
      // Window content
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("window-content");
      if (this.options.isExternal || this.isURL(this.content)) {
        const iframe = document.createElement("iframe");
        iframe.src = this.content;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.overflow = "hidden";
        iframe.scrolling = "no";
        contentDiv.appendChild(iframe);
      } else {
        contentDiv.innerHTML = this.content;
      }
  
      windowDiv.appendChild(header);
      windowDiv.appendChild(contentDiv);
  
      // Add resize functionality
      if (this.options.resizable) {
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("resize-handle");
        windowDiv.appendChild(resizeHandle);
        this.makeWindowResizable(windowDiv, resizeHandle);
      }
  
      desktop.appendChild(windowDiv);
  
      // Enable dragging
      if (this.options.draggable) {
        this.makeWindowDraggable(windowDiv);
      }
  
      this.addToTaskbar();
    }
  
    isURL(str) {
      const pattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      return pattern.test(str);
    }
  
    addToTaskbar() {
      const taskbar = document.getElementById("taskbar");
      if (!taskbar) {
        console.error("Taskbar not found");
        return;
      }
  
      this.taskbarItem = document.createElement("div");
      this.taskbarItem.classList.add("taskbar-item");
      this.taskbarItem.id = `taskbar-${this.title}`;
      this.taskbarItem.innerHTML = `<img src="${this.iconPath}" alt="${this.title} Icon">`;
      this.taskbarItem.onclick = () => this.restoreWindow();
      taskbar.appendChild(this.taskbarItem);
    }
  
    restoreWindow() {
      const windowElement = document.getElementById(`window-${this.title}`);
      if (windowElement) {
        windowElement.style.display = "block";
        this.isMinimized = false;
      }
  
      if (this.taskbarItem) {
        this.taskbarItem.remove();
        this.taskbarItem = null;
      }
  
      this.addToTaskbar();
    }
  
    minimizeWindow(windowElement) {
      windowElement.style.display = "none";
      this.isMinimized = true;
  
      if (!this.taskbarItem) {
        this.addToTaskbar();
      }
    }
  
    closeWindow(windowElement) {
      windowElement.remove();
      if (this.taskbarItem) {
        this.taskbarItem.remove();
      }
    }
  
    toggleMaximize(windowElement) {
      if (windowElement.style.width === "100%") {
        windowElement.style.width = `${this.options.width}px`;
        windowElement.style.height = `${this.options.height}px`;
      } else {
        windowElement.style.width = "100%";
        windowElement.style.height = "100%";
        windowElement.style.left = "0";
        windowElement.style.top = "0";
      }
    }
  
    makeWindowDraggable(windowElement) {
      let offsetX, offsetY;
      windowElement.querySelector(".window-header").onmousedown = (e) => {
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
  
        document.onmousemove = (e) => {
          windowElement.style.left = `${e.clientX - offsetX}px`;
          windowElement.style.top = `${e.clientY - offsetY}px`;
        };
  
        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  
    makeWindowResizable(windowElement, resizeHandle) {
      let isResizing = false;
  
      resizeHandle.onmousedown = (e) => {
        isResizing = true;
        const initialWidth = windowElement.offsetWidth;
        const initialHeight = windowElement.offsetHeight;
        const initialX = e.clientX;
        const initialY = e.clientY;
  
        document.onmousemove = (e) => {
          if (isResizing) {
            windowElement.style.width = `${initialWidth + (e.clientX - initialX)}px`;
            windowElement.style.height = `${initialHeight + (e.clientY - initialY)}px`;
          }
        };
  
        document.onmouseup = () => {
          isResizing = false;
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  }
  
  // Example usage
  document.addEventListener("DOMContentLoaded", () => {
    const window1 = new Window("My App", "Welcome to the app!", "app-icons/app.png");
  });
  const webApp = new Window("Terminal", "https://andre-cmd-rgb.github.io/Web-OS/");

  new Window("Calculator", "apps/calc.html", "app-icons/app.png", {
    width: 320,
    height: 450,
    left: 150,
    top: 100,
    isExternal: true,
  });
  
  // Change background function
  function changeBackground(imagePath) {
    const desktop = document.getElementById("desktop");
    if (desktop) {
      desktop.style.backgroundImage = `url('${imagePath}')`;
    }
  }
  
  // Load wallpapers dynamically from a folder and generate preview thumbnails
  function loadWallpapers() {
    const wallpapers = [
      'wallpaper-1.png', 'wallpaper-2.png', 'wallpaper-3.jpg', // Add other wallpaper filenames here
    ];
  
    const backgroundListDiv = document.querySelector('.background-list');
    wallpapers.forEach(wallpaper => {
      const previewImage = document.createElement("img");
      previewImage.src = `wallpapers/${wallpaper}`;
      previewImage.alt = wallpaper;
      previewImage.style.width = '100px'; // Preview size (adjust as necessary)
      previewImage.style.height = 'auto';
      previewImage.style.margin = '10px';
      previewImage.onclick = () => changeBackground(`wallpapers/${wallpaper}`);
      backgroundListDiv.appendChild(previewImage);
    });
  }
  
  // Create "Change Background" app with dynamic content
  const backgroundAppContent = `
    <div class="background-app">
      <h3>Select a Background</h3>
      <div class="background-list" style="display: flex; flex-wrap: wrap; padding: 10px;"></div>
    </div>
  `;
  
  new Window("Change Background", backgroundAppContent, "app-icons/theme.png", {
    width: 400,
    height: 300,
    left: 200,
    top: 150,
  });
  
  // After the window is created, load the wallpapers
  document.addEventListener('DOMContentLoaded', loadWallpapers);
  
