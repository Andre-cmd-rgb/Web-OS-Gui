class Window {
  constructor(title, content, iconPath = "app-icons/app.png", options = {}) {
      this.title = title;
      this.content = content;
      this.iconPath = iconPath;
      this.isMinimized = false;
      this.taskbarItem = null;

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

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("window-content");
      if (this.options.isExternal || this.isURL(this.content)) {
          const iframe = document.createElement("iframe");
          iframe.src = this.content;
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
          contentDiv.appendChild(iframe);
      } else {
          contentDiv.innerHTML = this.content;
      }

      windowDiv.appendChild(header);
      windowDiv.appendChild(contentDiv);

      if (this.options.resizable) {
          const resizeHandle = document.createElement("div");
          resizeHandle.classList.add("resize-handle");
          windowDiv.appendChild(resizeHandle);
          this.makeWindowResizable(windowDiv, resizeHandle);
      }

      desktop.appendChild(windowDiv);

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

class NotificationManager {
  constructor() {
    this.notificationContainer = document.getElementById("notifications");

    if (!this.notificationContainer) {
      this.notificationContainer = document.createElement("div");
      this.notificationContainer.id = "notifications";
      this.notificationContainer.style.position = "fixed";
      this.notificationContainer.style.top = "20px"; 
      this.notificationContainer.style.right = "20px";
      this.notificationContainer.style.width = "300px";
      this.notificationContainer.style.zIndex = "1000";
      document.body.appendChild(this.notificationContainer);
    }
  }

  createNotification(title, message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.classList.add("notification", `notification-${type}`);
    notification.style.position = "relative";
    notification.style.padding = "15px";
    notification.style.marginBottom = "10px";
    notification.style.borderRadius = "8px";
    notification.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    notification.style.backgroundColor = this.getBackgroundColor(type);
    notification.style.color = "#fff";
    notification.style.backdropFilter = "blur(8px)";
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s, transform 0.3s";
    notification.style.transform = "translateY(-20px)"; 

    const titleElement = document.createElement("strong");
    titleElement.innerText = title;
    titleElement.style.display = "block";
    titleElement.style.marginBottom = "5px";

    const messageElement = document.createElement("span");
    messageElement.innerText = message;

    const closeButton = document.createElement("button");
    closeButton.innerText = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.border = "none";
    closeButton.style.background = "transparent";
    closeButton.style.color = "#fff";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "18px";
    closeButton.style.fontWeight = "bold";
    closeButton.onclick = () => this.removeNotification(notification);

    notification.appendChild(titleElement);
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);

    this.notificationContainer.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 10);


    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification), duration);
    }
  }

  removeNotification(notification) {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(-20px)";
    setTimeout(() => notification.remove(), 300);
  }

  getBackgroundColor(type) {
    switch (type) {
      case "success":
        return "rgba(76, 175, 80, 0.8)"; 
      case "error":
        return "rgba(244, 67, 54, 0.8)";
      case "warning":
        return "rgba(255, 152, 0, 0.8)";
      default:
        return "rgba(33, 150, 243, 0.8)";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const notificationManager = new NotificationManager();

  new Window("My App", "Welcome to the app!", "app-icons/app.png");
  new Window("Terminal", "https://andre-cmd-rgb.github.io/Web-OS/", "app-icons/terminal.png", {
    width: 800, // Specify the desired width
    height: 600, // Specify the desired height
    left: 100, // Optional positioning
    top: 50,   // Optional positioning
    isExternal: true,
  });
  
  new Window("Calculator", "apps/calc.html", "app-icons/app.png", {
    width: 320,
    height: 450,
    left: 150,
    top: 100,
    isExternal: true,
  });

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

  setTimeout(() => {
    notificationManager.createNotification(
      "Example App",
      "Your process completed successfully!",
      "success"
    );
  }, 2000);

  setTimeout(() => {
    notificationManager.createNotification(
      "Example App",
      "Warning: Low disk space detected.",
      "warning",
      7000
    );
  }, 5000);

  setTimeout(() => {
    notificationManager.createNotification(
      "Example App",
      "Failed to connect to the server.",
      "error",
      0
    );
  }, 8000);

  function changeBackground(imagePath) {
    const desktop = document.getElementById("desktop");
    if (desktop) {
      desktop.style.backgroundImage = `url('${imagePath}')`;
    }
  }

  function loadWallpapers() {
    const wallpapers = ['wallpaper-1.png', 'wallpaper-2.png', 'wallpaper-3.jpg'];
    const backgroundListDiv = document.querySelector('.background-list');

    wallpapers.forEach(wallpaper => {
      const previewImage = document.createElement("img");
      previewImage.src = `wallpapers/${wallpaper}`;
      previewImage.alt = wallpaper;
      previewImage.style.width = '100px';
      previewImage.style.height = 'auto';
      previewImage.style.margin = '10px';
      previewImage.onclick = () => changeBackground(`wallpapers/${wallpaper}`);
      backgroundListDiv.appendChild(previewImage);
    });
  }

  loadWallpapers();
});
