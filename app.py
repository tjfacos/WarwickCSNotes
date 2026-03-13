import json
import os
from flask import Flask, render_template, abort
from jinja2 import ChoiceLoader, FileSystemLoader
from note_loader import load_note_content

app = Flask(__name__, template_folder="Pages", static_folder="Stylesheets")
app.jinja_loader = ChoiceLoader([
    FileSystemLoader("Pages"),
    FileSystemLoader("components"),
])

YEAR_DATA_DIR = os.path.join(os.path.dirname(__file__), "YearData")
NOTE_DATA_DIR = os.path.join(os.path.dirname(__file__), "NoteData")

@app.route("/")
def index():
    return render_template("Welcome.html")

@app.route("/year/<int:year_num>")
def year(year_num):
    if year_num not in (1, 2, 3):
        abort(404)

    path = os.path.join(YEAR_DATA_DIR, f"year{year_num}.json")
    with open(path) as f:
        year_data = json.load(f)

    return render_template("Year.html", year_data=year_data)

@app.route("/module/<code>")
def module(code):
    for year_num in (1, 2, 3):
        path = os.path.join(YEAR_DATA_DIR, f"year{year_num}.json")
        with open(path) as f:
            year_data = json.load(f)
        for mod_code, mod in year_data["modules"].items():
            if mod_code.upper() == code.upper():
                return render_template("Module.html", module={**mod, "code": mod_code}, year=year_num, year_data=year_data)
    abort(404)

@app.route("/notes/<module_code>/<note_name>")
def note(module_code, note_name):
    content = load_note_content(note_name, NOTE_DATA_DIR)
    if content is None:
        abort(404)

    # Find the module for back-button and navbar context
    for year_num in (1, 2, 3):
        path = os.path.join(YEAR_DATA_DIR, f"year{year_num}.json")
        with open(path) as f:
            year_data = json.load(f)
        for mod_code, mod in year_data["modules"].items():
            if mod_code.upper() == module_code.upper():
                return render_template(
                    "Notes.html",
                    content=content,
                    note_title=note_name,
                    module={**mod, "code": mod_code},
                    year=year_num,
                    year_data=year_data,
                )
    abort(404)

if __name__ == "__main__":
    app.run(debug=True)
