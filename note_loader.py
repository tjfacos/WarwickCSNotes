import os
import markdown
import pypandoc


def load_markdown(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    return markdown.markdown(raw, extensions=["tables", "fenced_code", "toc"])


def load_latex(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    return pypandoc.convert_text(raw, "html", format="latex", extra_args=["--mathjax"])


def load_note_content(note_name, note_data_dir):
    """Try .md then .tex. Returns HTML content string, or None if not found."""
    md_path = os.path.join(note_data_dir, f"{note_name}.md")
    tex_path = os.path.join(note_data_dir, f"{note_name}.tex")

    if os.path.isfile(md_path):
        return load_markdown(md_path)

    if os.path.isfile(tex_path):
        return load_latex(tex_path)

    return None
