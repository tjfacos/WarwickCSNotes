import json
import os
from flask import Flask, abort, Response

app = Flask(__name__)

BASE_DIR = os.path.dirname(__file__)
YEAR_DATA_DIR = os.path.join(BASE_DIR, "Data", "YearData")
NOTE_DATA_DIR = os.path.join(BASE_DIR, "Data", "NoteData")
CREDITS_DIR = os.path.join(BASE_DIR, "Data", "Credits")
CREDITS_FILE = os.path.join(CREDITS_DIR, "people.json")
NOTE_EXTENSIONS = ('md', 'tex', 'typ')

@app.route("/api/year/<int:year_num>")
def api_year(year_num):
    if year_num not in (1, 2, 3):
        abort(404)
    with open(os.path.join(YEAR_DATA_DIR, f"year{year_num}.json")) as f:
        return json.load(f)

@app.route("/api/module/<code>")
def api_module(code):
    for year_num in (1, 2, 3):
        with open(os.path.join(YEAR_DATA_DIR, f"year{year_num}.json")) as f:
            year_data = json.load(f)
        for mod_code, mod in year_data["modules"].items():
            if mod_code.upper() == code.upper():
                return {**mod, "code": mod_code, "year": year_num}
    abort(404)

@app.route("/api/credits")
def api_credits():
    with open(CREDITS_FILE) as f:
        return json.load(f)

@app.route("/api/credits/notes")
def api_credits_notes():
    with open(os.path.join(CREDITS_DIR, "notes.json")) as f:
        return json.load(f)

@app.route("/notes/<module_code>/<note_name>")
def note(module_code, note_name):
    if '.' in note_name:
        path = os.path.join(NOTE_DATA_DIR, note_name)
        ext = note_name.rsplit('.', 1)[-1]
    else:
        path = None
        ext = None
        for e in NOTE_EXTENSIONS:
            p = os.path.join(NOTE_DATA_DIR, f"{note_name}.{e}")
            if os.path.exists(p):
                path = p
                ext = e
                break

    if not path or not os.path.exists(path):
        abort(404)

    with open(path, encoding='utf-8') as f:
        content = f.read()
    return Response(content, content_type='text/plain', headers={'X-Note-Extension': ext})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
