from PIL import Image, ImageDraw
from pathlib import Path

src = Path(r"C:/Users/dhion/.openclaw/workspace/pomodoro-glass/pomodoro-screenshot.png")
outdir = Path(r"C:/Users/dhion/.openclaw/workspace/pomodoro-glass/docs")
outdir.mkdir(parents=True, exist_ok=True)

img = Image.open(src).convert("RGB").resize((960, 540))
steps = [
    "1) Pick Focus mode",
    "2) Press Start",
    "3) Add your study task",
    "4) Flow. Finish. Repeat.",
]
frames = []
for text in steps:
    frame = img.copy()
    draw = ImageDraw.Draw(frame)
    overlay_h = 72
    draw.rectangle([(0, 540 - overlay_h), (960, 540)], fill=(12, 12, 20))
    draw.text((24, 540 - overlay_h + 20), text, fill=(255, 255, 255))
    frames.append(frame)

frames[0].save(outdir / "tutorial.gif", save_all=True, append_images=frames[1:], duration=[900, 900, 900, 1100], loop=0)
print("ok")
