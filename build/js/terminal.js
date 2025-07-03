import FileSystem from './fs.js';
import CommandHistoryManager from './history.js';
import { commands } from './commands.js';

class WebOS {
  constructor(terminalElement) {
    this.terminal = terminalElement;
    this.prompt = "> ";
    this.fileSystem = new FileSystem();
    this.currentDirectory = "root";
    this.commandHistoryManager = new CommandHistoryManager();
    this.init();
  }

  async init() {
    await this.fileSystem.init();

    try {
      await this.fileSystem.createDirectory("root");
    } catch (error) {}

    this.print("Welcome to Web OS!");
    this.print("Type 'help' for a list of commands.");
    this.newPrompt();
    this.setupInputListener();
  }

  newPrompt() {
    const promptLine = document.createElement("div");
    promptLine.classList.add("prompt-line");
    promptLine.innerHTML = `${this.prompt}<span id="input-line" contenteditable="true"></span>`;
    this.terminal.appendChild(promptLine);

    const inputLine = document.querySelector("#input-line");

    inputLine.setAttribute("spellcheck", "false");
    inputLine.setAttribute("autocapitalize", "none");
    inputLine.setAttribute("autocomplete", "off");
    inputLine.setAttribute("autocorrect", "off");
    
    this.focusInput(); 
    this.scrollTerminal();
  }

  focusInput() {
    const inputElement = this.terminal.querySelector("#input-line");
    if (inputElement) {
      inputElement.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputElement);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  setupInputListener() {
    document.addEventListener("keydown", async (event) => {
      const inputElement = document.querySelector("#input-line");
      if (!inputElement) return;

      if (event.ctrlKey || event.metaKey) return;

      switch (event.key) {
        case "Enter":
          event.preventDefault();
          const command = inputElement.textContent.trim();
          inputElement.removeAttribute("contenteditable");
          inputElement.removeAttribute("id");
          await this.processCommand(command);
          if (command) {
            await this.commandHistoryManager.saveCommandToHistory(command);
          }
          this.newPrompt();
          break;
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          this.commandHistoryManager.handleArrowKeyNavigation(event, inputElement);
          break;
        default:
          break;
      }
    });

    document.addEventListener("paste", (event) => {
      const inputElement = document.querySelector("#input-line");
      if (!inputElement) return;

      event.preventDefault();
      const pastedText = event.clipboardData.getData("text");
      const currentText = inputElement.textContent;
      inputElement.textContent = currentText + pastedText;
      this.focusInput();
    });
    
    this.terminal.addEventListener('click', () => {
        this.focusInput();
    });

    this.terminal.addEventListener("touchstart", () => {
      this.focusInput();
    });
  }

  async processCommand(command) {
    if (!command) return;

    const [cmd, ...args] = command.split(" ");
    try {
      if (commands[cmd]) {
        await commands[cmd](this, args);
      } else {
        this.commandNotFound(cmd);
      }
    } catch (error) {
      this.print(`Error: ${error.message}`);
    }
  }

  commandNotFound(cmd) {
    this.print(`Unknown command: ${cmd}`);
  }

  print(text, options = {}) {
    const outputLine = document.createElement("div");
    if (options.isHTML) {
      outputLine.innerHTML = text;
    } else {
      outputLine.textContent = text;
    }
    this.terminal.appendChild(outputLine);
    this.scrollTerminal();
  }

  clearScreen() {
    this.terminal.innerHTML = "";
  }

  scrollTerminal() {
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }
  
  _getFullPath(path) {
    if (path.startsWith("/")) {
      return path;
    } else {
      return `${this.currentDirectory}/${path}`;
    }
  }

  async _updateParentDirectory(filePath) {
    const parentPath = this._getParentDirectory(filePath);
    const parentDir = await this.fileSystem.performTransaction(this.fileSystem.storeName, (store) => store.get(parentPath));
    if (parentDir && parentDir.type === "directory") {
      if (!parentDir.contents.includes(filePath)) {
        parentDir.contents.push(filePath);
        await this.fileSystem.performTransaction(this.fileSystem.storeName, (store) => store.put(parentDir), "readwrite");
      }
    }
  }

  async _checkIfPathExists(path) {
    const entry = await this.fileSystem.performTransaction(this.fileSystem.storeName, (store) => store.get(path));
    return entry !== undefined;
  }

  _getParentDirectory(path) {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/") || "root";
  }
}

window.onload = () => {
  const terminalElement = document.getElementById("terminal");
  window.webosInstance = new WebOS(terminalElement);
};