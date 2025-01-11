import os
import shutil
from flask import Flask, render_template
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Initialize the Flask app
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="build",  # Static files served from the 'build' directory
    static_url_path="/"     # Serve static files at the root URL path
)

# Paths
BUILD_DIR = "build"
STATIC_SRC = "static"
TEMPLATE_SRC = "templates/index.html"

# Function to set up the build directory initially
def setup_build_directory():
    # Ensure the build directory exists
    if not os.path.exists(BUILD_DIR):
        os.makedirs(BUILD_DIR)
    
    # Copy static files
    if os.path.exists(STATIC_SRC):
        shutil.copytree(STATIC_SRC, BUILD_DIR, dirs_exist_ok=True)
    
    # Copy the index.html file
    if os.path.exists(TEMPLATE_SRC):
        shutil.copy(TEMPLATE_SRC, BUILD_DIR)

# Function to sync an individual file
def sync_file(src_path, build_path):
    """Sync a single file from the source to the build directory."""
    if os.path.exists(src_path):
        # Ensure the directory structure exists in the build directory
        target_dir = os.path.dirname(build_path)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
        # Copy the file
        shutil.copy2(src_path, build_path)
        print(f"Synced: {src_path} -> {build_path}")
    else:
        # If the file is deleted, remove it from the build directory
        if os.path.exists(build_path):
            os.remove(build_path)
            print(f"Deleted: {build_path}")

# File system event handler for live synchronization
class BuildSyncHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        src_path = event.src_path
        if src_path.startswith(STATIC_SRC):
            # Map the source path to the build directory
            relative_path = os.path.relpath(src_path, STATIC_SRC)
            build_path = os.path.join(BUILD_DIR, relative_path)
            sync_file(src_path, build_path)
        elif src_path == TEMPLATE_SRC:
            build_path = os.path.join(BUILD_DIR, "index.html")
            sync_file(src_path, build_path)

    def on_created(self, event):
        self.on_modified(event)

    def on_deleted(self, event):
        self.on_modified(event)

# Function to start the file watcher
def start_file_watcher():
    observer = Observer()
    handler = BuildSyncHandler()
    observer.schedule(handler, path=STATIC_SRC, recursive=True)
    observer.schedule(handler, path=os.path.dirname(TEMPLATE_SRC), recursive=True)
    observer.start()
    print("File watcher started.")
    return observer

# Set up the build directory before starting the app
setup_build_directory()

# Start the file watcher in a separate thread
observer = start_file_watcher()

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    try:
        app.run(debug=True, use_reloader=False)  # Disable Flask's built-in reloader to avoid conflicts
    finally:
        observer.stop()
        observer.join()
