class Window {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.createWindow();
  }

  createWindow() {
    const windowsContainer = document.getElementById("windows-container");
    if (!windowsContainer) {
      console.error("windows-container not found");
      return;
    }

    const windowDiv = document.createElement("div");
    windowDiv.classList.add("window");
    windowDiv.setAttribute("id", `window-${this.title}`);
    windowDiv.style.position = "absolute"; // Make the window draggable
    windowDiv.style.left = "100px"; // Default position (can be changed)
    windowDiv.style.top = "100px";  // Default position (can be changed)
    windowDiv.style.zIndex = 1;     // Make sure the window starts with a z-index

    // Create header with title and buttons (minimize, maximize, close)
    const header = document.createElement("div");
    header.classList.add("window-header");
    header.innerHTML = `<span>${this.title}</span>
                        <div class="window-btns">
                          <button class="window-btn minimize"></button>
                          <button class="window-btn maximize"></button>
                          <button class="window-btn close"></button>
                        </div>`;

    // Buttons functionality
    const minimizeButton = header.querySelector('.minimize');
    minimizeButton.addEventListener('click', () => this.minimizeWindow(windowDiv));
    
    const maximizeButton = header.querySelector('.maximize');
    maximizeButton.addEventListener('click', () => this.maximizeWindow(windowDiv));
    
    const closeButton = header.querySelector('.close');
    closeButton.addEventListener('click', () => this.closeWindow(windowDiv));

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("window-content");

    // If content is a URL, embed it in an iframe (web browser functionality)
    if (this.isURL(this.content)) {
      const iframe = document.createElement("iframe");
      iframe.src = this.content;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      contentDiv.appendChild(iframe);
    } else {
      contentDiv.innerHTML = this.content;
    }

    windowDiv.appendChild(header);
    windowDiv.appendChild(contentDiv);

    // Create a resize handle
    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");
    windowDiv.appendChild(resizeHandle);

    windowsContainer.appendChild(windowDiv);

    this.makeWindowDraggable(windowDiv);
    this.makeWindowResizable(windowDiv, resizeHandle);
  }

  // Function to check if content is a URL
  isURL(str) {
    const pattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    return pattern.test(str);
  }

  makeWindowDraggable(windowElement) {
    const header = windowElement.querySelector(".window-header");
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // When mouse is pressed down
    header.addEventListener("mousedown", (event) => {
      isDragging = true;
      offsetX = event.clientX - windowElement.offsetLeft;
      offsetY = event.clientY - windowElement.offsetTop;
      windowElement.style.zIndex = 1000; // Bring window to the front during dragging
    });

    // When mouse is moved (track drag across the document)
    document.addEventListener("mousemove", (event) => {
      if (isDragging) {
        windowElement.style.left = `${event.clientX - offsetX}px`;
        windowElement.style.top = `${event.clientY - offsetY}px`;
      }
    });

    // When mouse is released (end dragging)
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }

  makeWindowResizable(windowElement, resizeHandle) {
    let isResizing = false;
    let initialWidth = windowElement.offsetWidth;
    let initialHeight = windowElement.offsetHeight;
    let initialMouseX = 0;
    let initialMouseY = 0;

    resizeHandle.addEventListener("mousedown", (event) => {
      isResizing = true;
      initialWidth = windowElement.offsetWidth;
      initialHeight = windowElement.offsetHeight;
      initialMouseX = event.clientX;
      initialMouseY = event.clientY;
      windowElement.style.zIndex = 1000; // Bring window to the front during resizing
    });

    document.addEventListener("mousemove", (event) => {
      if (isResizing) {
        const deltaX = event.clientX - initialMouseX;
        const deltaY = event.clientY - initialMouseY;
        windowElement.style.width = `${initialWidth + deltaX}px`;
        windowElement.style.height = `${initialHeight + deltaY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isResizing = false;
    });
  }

  minimizeWindow(windowElement) {
    windowElement.style.display = "none"; // Minimize the window by hiding it
  }

  maximizeWindow(windowElement) {
    windowElement.style.width = "100%"; // Maximize to full screen width
    windowElement.style.height = "100%"; // Maximize to full screen height
    windowElement.style.left = "0";
    windowElement.style.top = "0";
  }

  closeWindow(windowElement) {
    windowElement.remove(); // Remove the window from the DOM
  }
}

// Function to open a new window
function openWindow() {
  const newWindow = new Window("Example Window", "<p>This is an example window!</p>");
}

// Example usage of openWindow
openWindow();

// Function to open a new browser window
function openBrowserWindow(url) {
  const newWindow = new Window("Web Browser", url);
}
// Open the browser window with a website
openBrowserWindow('https://www.example.com');
