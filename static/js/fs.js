class FileSystem {
  constructor() {
    this.dbName = "WebOSFileSystem";
    this.storeName = "FileSystemStore";
    this.db = null; // Store the reference to the DB
  }

  // Initialize the IndexedDB database
  async init() {
    if (this.db) {
      return this.db; // If already initialized, return the existing db
    }

    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "path" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(new Error("Failed to open database: " + event.target.error));
    });

    return this.db;
  }

  // Perform a transaction on the store
  async performTransaction(storeName, operation, mode = "readonly") {
    if (!this.db) {
      await this.init(); // Ensure DB is initialized
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(new Error("Transaction failed: " + event.target.error));
    });
  }

  // Create a new directory
  async createDirectory(path) {
    if (path.startsWith("/")) {
      path = path.slice(1); // Remove leading slash if any
    }

    const existingEntry = await this.performTransaction(this.storeName, (store) => store.get(path));
    if (existingEntry) {
      throw new Error("Path already exists");
    }

    const entry = { path, type: "directory", contents: [] };
    await this.performTransaction(this.storeName, (store) => store.add(entry), "readwrite");

    // Update parent directory after creation
    await this._updateParentDirectory(path);
  }

  // Check if the path already exists in the file system
  async _checkIfPathExists(path) {
    const entry = await this.performTransaction(this.storeName, (store) => store.get(path));
    return entry !== undefined;
  }

  // Update parent directory by adding the new path to its contents
  async _updateParentDirectory(filePath) {
    const parentPath = this._getParentDirectory(filePath);
    const parentDir = await this.performTransaction(this.storeName, (store) => store.get(parentPath));

    if (parentDir && parentDir.type === "directory") {
      if (!parentDir.contents.includes(filePath)) {
        parentDir.contents.push(filePath);
        await this.performTransaction(this.storeName, (store) => store.put(parentDir), "readwrite");
      }
    } else {
      throw new Error("Parent directory not found or is not a directory");
    }
  }

  // Helper to get the parent directory path from the current path
  _getParentDirectory(path) {
    const parts = path.split("/");
    parts.pop(); // Remove the file or directory name
    return parts.join("/") || "/";  // "/" if at the root
  }

  // Save or update a file
  async writeFile(path, data) {
    if (path.startsWith("/")) {
      path = path.slice(1); // Remove leading slash if any
    }

    const existingEntry = await this.performTransaction(this.storeName, (store) => store.get(path));

    if (existingEntry) {
      if (existingEntry.type !== "file") {
        throw new Error("Cannot save: The specified path is not a file");
      }
      // Update existing file content
      existingEntry.content = data;
      await this.performTransaction(this.storeName, (store) => store.put(existingEntry), "readwrite");
    } else {
      // Create a new file if it doesn't exist
      await this.createFile(path, data);
    }
  }

  async createFile(path, data) {
    if (path.startsWith("/")) {
      path = path.slice(1);
    }

    const existingEntry = await this.performTransaction(this.storeName, (store) => store.get(path));
    if (existingEntry) {
      throw new Error("Path already exists");
    }

    const parentDirPath = this._getParentDirectory(path);
    if (parentDirPath) {
      const parentDir = await this.performTransaction(this.storeName, (store) => store.get(parentDirPath));
      if (!parentDir || parentDir.type !== "directory") {
        throw new Error("Parent directory does not exist");
      }
      parentDir.contents.push(path);
      await this.performTransaction(this.storeName, (store) => store.put(parentDir), "readwrite");
    }

    const entry = { path, type: "file", content: data };
    await this.performTransaction(this.storeName, (store) => store.add(entry), "readwrite");
  }

  // List contents of a directory
  async listContents(path) {
    const directory = await this.performTransaction(this.storeName, (store) => store.get(path));
    if (!directory || directory.type !== "directory") {
      throw new Error("Directory not found");
    }
    return directory.contents || [];
  }
  // Read the contents of a file
  async readFile(path) {
    if (path.startsWith("/")) {
      path = path.slice(1); // Remove leading slash if any
    }

    const entry = await this.performTransaction(this.storeName, (store) => store.get(path));

    if (!entry) {
      throw new Error("File not found");
    }

    if (entry.type !== "file") {
      throw new Error("The specified path is not a file");
    }

    return entry.content; // Return the file's content
  }

  // Delete a directory or file
  async deleteEntry(path) {
    const entry = await this.performTransaction(this.storeName, (store) => store.get(path));
    if (!entry) {
      throw new Error("Entry not found");
    }

    if (entry.type === "directory") {
      if (entry.contents.length > 0) {
        throw new Error("Directory is not empty");
      }
    }

    await this.performTransaction(this.storeName, (store) => store.delete(path), "readwrite");

    const parentDirPath = this._getParentDirectory(path);
    if (parentDirPath) {
      const parentDir = await this.performTransaction(this.storeName, (store) => store.get(parentDirPath));
      if (parentDir && parentDir.type === "directory") {
        const index = parentDir.contents.indexOf(path);
        if (index !== -1) {
          parentDir.contents.splice(index, 1);
          await this.performTransaction(this.storeName, (store) => store.put(parentDir), "readwrite");
        }
      }
    }
  }
}

export default FileSystem;
