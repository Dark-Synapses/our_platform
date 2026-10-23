from PIL import Image
from pathlib import Path

names = [
    "service-ai",
    "service-cyber",
    "service-ai-security",
    "service-automation",
]

downloads = Path.home() / "Downloads"
output = Path.home() / "our_platform/frontend/public/images"

for name in names:
    image = Image.open(downloads / f"{name}.png").convert("RGB")
    image.save(output / f"{name}.webp", "WEBP", quality=88)

print("All service images are ready!")