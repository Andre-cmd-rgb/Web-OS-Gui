class Window {
  constructor(title, content, iconPath = "static/app-icons/app.png") {
    this.title = title;
    this.content = content;
    this.iconPath = iconPath;
    this.isMinimized = false;
    this.taskbarItem = null; // Track taskbar item to avoid duplicates
    this.createWindow();
  }

  createWindow() {
    const windowsContainer = document.getElementById("desktop");
    if (!windowsContainer) {
      console.error("windows-container not found");
      return;
    }

    const windowDiv = document.createElement("div");
    windowDiv.classList.add("window");
    windowDiv.setAttribute("id", `window-${this.title}`);
    windowDiv.style.position = "absolute";
    windowDiv.style.left = "100px";
    windowDiv.style.top = "100px";
    windowDiv.style.zIndex = 1;

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

    const closeButton = header.querySelector('.close');
    closeButton.addEventListener('click', () => this.closeWindow(windowDiv));

    const maximizeButton = header.querySelector('.maximize');
    maximizeButton.addEventListener('click', () => this.toggleMaximize(windowDiv));

    const minimizeButton = header.querySelector('.minimize');
    minimizeButton.addEventListener('click', () => this.minimizeWindow(windowDiv));

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("window-content");

    // Check if the content is a URL, then create an iframe for web apps
    if (this.isURL(this.content)) {
      const iframe = document.createElement("iframe");
      iframe.src = this.content;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      contentDiv.appendChild(iframe);
    } else {
      // Otherwise, load static content
      contentDiv.innerHTML = this.content;
    }

    windowDiv.appendChild(header);
    windowDiv.appendChild(contentDiv);

    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");
    windowDiv.appendChild(resizeHandle);

    windowsContainer.appendChild(windowDiv);

    this.makeWindowDraggable(windowDiv);
    this.makeWindowResizable(windowDiv, resizeHandle);

    // Add to taskbar only if window is not minimized
    if (!this.isMinimized) {
      this.addToTaskbar();
    }
  }

  isURL(str) {
    const pattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    return pattern.test(str);
  }

  addToTaskbar() {
    const taskbar = document.getElementById("taskbar");
    if (!taskbar) {
      console.error("taskbar not found");
      return;
    }

    // Only create a taskbar item if it doesn't already exist
    if (!document.getElementById(`taskbar-${this.title}`)) {
      this.taskbarItem = document.createElement("div");
      this.taskbarItem.classList.add("taskbar-item");
      this.taskbarItem.id = `taskbar-${this.title}`;
      this.taskbarItem.innerHTML = `<img src="${this.iconPath}" alt="${this.title} Icon">`;
      this.taskbarItem.onclick = () => this.restoreWindow();
      taskbar.appendChild(this.taskbarItem);
    }
  }

  restoreWindow() {
    const windowElement = document.getElementById(`window-${this.title}`);
    windowElement.style.display = "block";
    this.isMinimized = false;

    // Remove taskbar item if exists
    if (this.taskbarItem) {
      this.taskbarItem.remove();
      this.taskbarItem = null;
    }

    this.addToTaskbar();
  }

  minimizeWindow(windowElement) {
    windowElement.style.display = "none";
    this.isMinimized = true;

    // Only add taskbar item if not already added
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
      windowElement.style.width = "300px";
      windowElement.style.height = "200px";
    } else {
      windowElement.style.width = "100%";
      windowElement.style.height = "100%";
    }
  }

  makeWindowDraggable(windowElement) {
    let offsetX, offsetY;
    windowElement.querySelector('.window-header').onmousedown = (e) => {
      offsetX = e.clientX - windowElement.getBoundingClientRect().left;
      offsetY = e.clientY - windowElement.getBoundingClientRect().top;
      
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

// Create a new web app (window with embedded webpage)
const webApp = new Window("Terminal", "https://andre-cmd-rgb.github.io/Web-OS/");

// Create a static window
const staticWindow = new Window("Static Window", "<h1>Static Content</h1><p>This is a static window with HTML content.</p>");
