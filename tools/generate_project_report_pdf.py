from pathlib import Path

from fpdf import FPDF


def _soft_wrap_long_tokens(text: str, max_token_len: int = 50) -> str:
    parts: list[str] = []
    for token in text.split(" "):
        if len(token) <= max_token_len:
            parts.append(token)
            continue
        start = 0
        while start < len(token):
            parts.append(token[start : start + max_token_len])
            start += max_token_len
    return " ".join(parts)


def write_markdown_like(pdf: FPDF, text: str) -> None:
    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        if not line:
            pdf.ln(3)
            continue

        if line.startswith("# "):
            pdf.set_font("Helvetica", "B", 16)
            pdf.multi_cell(190, 8, _soft_wrap_long_tokens(line[2:]))
            pdf.ln(1)
            continue
        if line.startswith("## "):
            pdf.set_font("Helvetica", "B", 13)
            pdf.multi_cell(190, 7, _soft_wrap_long_tokens(line[3:]))
            pdf.ln(1)
            continue
        if line.startswith("### "):
            pdf.set_font("Helvetica", "B", 11)
            pdf.multi_cell(190, 6, _soft_wrap_long_tokens(line[4:]))
            continue
        if line.startswith("- "):
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(190, 5.5, _soft_wrap_long_tokens(f"- {line[2:]}"))
            continue
        if line.startswith("---"):
            pdf.set_draw_color(190, 190, 190)
            y = pdf.get_y()
            pdf.line(10, y, 200, y)
            pdf.ln(3)
            continue

        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(190, 5.5, _soft_wrap_long_tokens(line))


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    source = root / "docs" / "JamiiFlow-Project-Success-Report.md"
    output = root / "docs" / "JamiiFlow-Project-Success-Report.pdf"

    text = source.read_text(encoding="utf-8")

    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.add_page()
    write_markdown_like(pdf, text)
    pdf.output(str(output))

    print(f"PDF generated: {output}")


if __name__ == "__main__":
    main()
