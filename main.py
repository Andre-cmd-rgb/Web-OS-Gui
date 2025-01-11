import os
import shutil
from flask import Flask, render_template

# Initialize the Flask app
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="build",          # Static files will be served from the 'build' directory
    static_url_path="/"             # Serve static files at the root URL path
)

# Function to set up the build directory
def setup_build_directory():
    build_dir = "build"
    static_src = "static"
    template_src = "templates/index.html"

    # Ensure the build directory exists
    if not os.path.exists(build_dir):
        os.makedirs(build_dir)
    
    # Copy static files
    if os.path.exists(static_src):
        shutil.copytree(static_src, build_dir, dirs_exist_ok=True)
    
    # Copy the index.html file
    if os.path.exists(template_src):
        shutil.copy(template_src, build_dir)

# Call the setup function before running the app
setup_build_directory()

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
