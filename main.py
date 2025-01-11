import os
import shutil
from flask import Flask, render_template
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


app = Flask(
    __name__,
    template_folder="templates",
    static_folder="build",
    static_url_path="/"
)

# Paths
BUILD_DIR = "build"
STATIC_SRC = "static"
TEMPLATE_SRC = "templates/index.html"


def setup_build_directory():
    if not os.path.exists(BUILD_DIR):
        os.makedirs(BUILD_DIR)
    
    # copyy
    if os.path.exists(STATIC_SRC):
        shutil.copytree(STATIC_SRC, BUILD_DIR, dirs_exist_ok=True)
    
    # copy my index
    if os.path.exists(TEMPLATE_SRC):
        shutil.copy(TEMPLATE_SRC, BUILD_DIR)

# works
def sync_file(src_path, build_path):
    if os.path.exists(src_path):
        target_dir = os.path.dirname(build_path)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
        # copy the file
        shutil.copy2(src_path, build_path)
        print(f"Synced: {src_path} -> {build_path}")
    else:
        if os.path.exists(build_path):
            os.remove(build_path)
            print(f"Deleted: {build_path}")

class BuildSyncHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        src_path = event.src_path
        if src_path.startswith(STATIC_SRC):
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

# start our watcher
def start_file_watcher():
    observer = Observer()
    handler = BuildSyncHandler()
    observer.schedule(handler, path=STATIC_SRC, recursive=True)
    observer.schedule(handler, path=os.path.dirname(TEMPLATE_SRC), recursive=True)
    observer.start()
    print("File watcher started.")
    return observer

setup_build_directory()


observer = start_file_watcher()

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    try:
        app.run(debug=True, use_reloader=False)
    finally:
        observer.stop()
        observer.join()
