"""Build writing.html and writing/<slug>.html from writing/tools/posts.md.
Run from anywhere:  python3 writing/tools/build.py
Edit titles/dates in POSTS_META below; edit text in the markdown file.
"""
import re, os, html, json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "writing", "tools", "posts.md")
OUT = os.path.join(ROOT, "writing")

# number -> display metadata. date = "" until known (e.g. "Oct 2026").
POSTS_META = {
    1: dict(date="Apr 1, 2026", img="tab1.jpeg",  alt="doppler.ai wordmark on a halftone dot pattern"),
    2: dict(date="May 8, 2026", img="tab2.jpeg",  alt="Illustration of cars queuing at a parking garage entrance while a driver checks a parking app"),
    3: dict(date="Jun 1, 2026", img="tab3.jpeg",  alt="Iridescent glass plants against a pale pink background"),
    4: dict(date="Jul 2, 2026", img="tab4-en.jpg", alt="Loop diagram: Framing, Prototype, Real usable code, Learning from the logs, Improve and optimize"),
    5: dict(date="Jul 16, 2026", img="tab5.jpeg",  alt="Figma banner on the New York Stock Exchange reading Design is everyone's business"),
    6: dict(date="Jul 23, 2026", img="tab6.jpeg",  alt="A mechanic working at a bicycle workshop bench"),
    7: dict(date="Jul 29, 2026", img="tab7.jpeg",  alt="Halftone portrait with the name Brad"),
    8: dict(date="Aug 4, 2026", img="tab8-en.jpg", alt="The Design Machine: a five-stage closed loop from knowledge and success criteria to adaptation"),
    9: dict(date="Sep 7, 2026", img="tab9.jpeg",  alt="Illustration of a food truck labelled Design Services serving customers"),
    10: dict(date="Sep 28, 2026", img="tab10.jpeg", alt="Illustration of a designer, Claude and Jev talking while AI-slop grenades fly overhead"),
    11: dict(date="Oct 6, 2026", img="tab11-en.jpg", alt="Five dots labelled: explore alternatives, understand and provide context, define and check quality, implement in code, learn and improve"),
}
SITE = "Yair Cohen — Principal High-Agency"
LINKEDIN = "https://www.linkedin.com/in/yairc/"

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\*\w])\*(?!\s)(.+?)(?<!\s)\*(?![\*\w])", r"<em>\1</em>", s)
    s = re.sub(r"(https?://[^\s<]+[^\s<.,)])", r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>', s)
    return s

def render(md):
    lines = md.strip("\n").split("\n")
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip() or ln.startswith(">"):   # skip blanks and reviewer notes
            i += 1; continue
        if ln.strip() == "---":
            out.append("<hr>"); i += 1; continue
        if ln.startswith("- "):
            items = []
            while i < len(lines) and (lines[i].startswith("- ") or lines[i].startswith("  ")):
                if lines[i].startswith("- "): items.append(lines[i][2:])
                else: items[-1] += "\n" + lines[i].strip()
                i += 1
            out.append("<ul>" + "".join("<li>" + "<br>".join(inline(p) for p in it.split("\n")) + "</li>" for it in items) + "</ul>")
            continue
        para = [ln]; i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("- ", ">", "---")):
            para.append(lines[i]); i += 1
        out.append("<p>" + "<br>".join(inline(p) for p in para) + "</p>")
    return "\n".join(out)

def slugify(t):
    s = re.sub(r"[^a-z0-9]+", "-", t.lower().replace("'", "")).strip("-")
    return "-".join(s.split("-")[:8])

def parse():
    txt = open(SRC, encoding="utf-8").read().split("\n# Image text")[0]
    parts = re.split(r"^## (\d+)\. (.*)$", txt, flags=re.M)
    posts = []
    for k in range(1, len(parts), 3):
        n, title, body = int(parts[k]), parts[k + 1].strip(), parts[k + 2]
        body = re.sub(r"^Date:.*$", "", body, count=1, flags=re.M)
        body = re.sub(r"\n---\s*$", "", body.rstrip())
        posts.append(dict(n=n, title=title, slug=f"{n:02d}-{slugify(title)}", body=body, **POSTS_META[n]))
    return posts

def nav(prefix, current):
    def link(label, href, key):
        u = "nav-underline" if key == current else "nav-underline home"
        cur = ' aria-current="page"' if key == current else ""
        return (f'<div data-page="{key}" class="nav-link-wrap"><a href="{prefix}{href}"{cur} '
                f'class="nav-link{" w--current" if key == current else ""}">{label}</a><div class="{u}"></div></div>')
    return ('<div class="grid"><div class="left-meta"><div class="div-block-12">'
            + link("Space", "index.html", "space") + '<div class="nav-comma">,</div>'
            + link("About", "about.html", "about") + '<div class="nav-comma">,</div>'
            + link("Writing", "writing.html", "writing") + '</div></div><div class="center-meta"></div>'
            '<div class="right-meta"><div class="local-time">IDT 10:23 AM</div>'
            '<a href="https://yair-cohen-cv.vercel.app/" target="_blank" rel="noopener noreferrer" class="local-time cv-link" '
            'style="grid-area:1 / 2 / 2 / 3;justify-self:end;text-decoration:none">CV</a>'
            '<a href="#" class="copy-email">Contact</a></div></div>')

SCRIPT = """<script>
(function(){var t=document.querySelector('.local-time');function u(){var n=new Date(),
tm=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jerusalem',hour:'numeric',minute:'2-digit',hour12:true}).format(n),
o=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jerusalem',timeZoneName:'shortOffset'}).format(n).split(' ').pop();
t.textContent=(o==='GMT+3'?'IDT ':'IST ')+tm}u();setInterval(u,1000);
var E='downstairsgroup@gmail.com';document.querySelectorAll('.copy-email').forEach(function(b){var o=b.textContent;
b.addEventListener('click',function(e){e.preventDefault();(navigator.clipboard?navigator.clipboard.writeText(E):Promise.reject()).catch(function(){}).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent=o},2000)})})})})();
</script>"""

def page(title, desc, prefix, body, current="writing", og=""):
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}">
<meta property="og:type" content="article">{og}
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="{prefix}assets/css/main.css" rel="stylesheet" type="text/css">
<link href="{prefix}writing/writing.css" rel="stylesheet" type="text/css">
<link href="{prefix}assets/img/6a27d0db13061be14ba10694_Favicon.jpg" rel="icon" type="image/png" sizes="32x32">
</head><body class="wr-body">
<header class="wr-nav">{nav(prefix, current)}</header>
{body}
{SCRIPT}
<script src="{prefix}assets/variants.js"></script>
</body></html>
"""

def strip_tags(s): return re.sub(r"<[^>]+>", "", s)

def main():
    posts = parse()
    newest_first = sorted(posts, key=lambda p: -p["n"])
    # ------- index
    rows = []
    for p in newest_first:
        d = f'<span class="wr-row-date">{p["date"]}</span>' if p["date"] else ""
        rows.append(f'<a class="wr-row" href="writing/{p["slug"]}.html"><span class="wr-row-n">{p["n"]:02d}</span>'
                    f'<span class="wr-row-main"><span class="wr-row-title">{html.escape(p["title"])}</span>{d}</span>'
                    f'<img class="wr-row-img" src="writing/img/{p["img"]}" alt="" loading="lazy"></a>')
    idx = (f'<main class="wr-main"><h1 class="wr-h1">Writing</h1>'
           f'<p class="wr-lede">Notes on product design, agents, and building the machine that builds the product. '
           f'Originally published on <a href="{LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn</a>, translated from Hebrew.</p>'
           f'<div class="wr-list">{"".join(rows)}</div></main>')
    open(os.path.join(ROOT, "writing.html"), "w", encoding="utf-8").write(
        page(f"Writing — {SITE}", "Notes on product design, AI agents and design systems by Yair Cohen.", "", idx))
    # ------- posts
    for p in posts:
        newer = next((q for q in posts if q["n"] == p["n"] + 1), None)
        older = next((q for q in posts if q["n"] == p["n"] - 1), None)
        pn = ""
        if newer: pn += f'<a class="wr-pn" href="{newer["slug"]}.html"><span>Newer</span>{html.escape(newer["title"])}</a>'
        if older: pn += f'<a class="wr-pn" href="{older["slug"]}.html"><span>Older</span>{html.escape(older["title"])}</a>'
        date = f'<span>{p["date"]}</span> · ' if p["date"] else ""
        body = (f'<main class="wr-main wr-post"><a class="wr-back" href="../writing.html">← Writing</a>'
                f'<h1 class="wr-h1 wr-post-h1">{html.escape(p["title"])}</h1>'
                f'<p class="wr-meta">{date}Originally published on <a href="{LINKEDIN}" target="_blank" rel="noopener noreferrer">LinkedIn</a> in Hebrew · translated to English</p>'
                f'<figure class="wr-hero"><img src="img/{p["img"]}" alt="{html.escape(p["alt"])}"></figure>'
                f'<article class="wr-prose">{render(p["body"])}</article>'
                f'<nav class="wr-pns">{pn}</nav></main>')
        first = strip_tags(render(p["body"]).split("</p>")[0])[:200]
        og = f'<meta property="og:image" content="img/{p["img"]}"><meta name="twitter:card" content="summary_large_image">'
        open(os.path.join(OUT, p["slug"] + ".html"), "w", encoding="utf-8").write(
            page(f'{p["title"]} — Yair Cohen', first, "../", body, og=og))
    print(len(posts), "posts built")

if __name__ == "__main__":
    main()
