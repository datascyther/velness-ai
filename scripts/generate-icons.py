#!/usr/bin/env python3
"""Generate Expo default assets from velness-logo.jpg"""

from PIL import Image, ImageOps
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'shared', 'assets')
LOGO_PATH = os.path.join(ASSETS_DIR, 'velness-logo.jpg')
BG_COLOR = (15, 10, 26)  # #0F0A1A brand dark

def make_square(img, size, bg_color):
    """Create a square image with logo centered on bg_color."""
    # Resize logo to fit within size (maintaining aspect ratio, 80% padding)
    logo = img.copy()
    max_logo_dim = int(size * 0.8)
    logo.thumbnail((max_logo_dim, max_logo_dim), Image.LANCZOS)

    square = Image.new('RGBA', (size, size), bg_color + (255,))
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2

    if logo.mode == 'RGBA':
        square.paste(logo, (x, y), logo)
    else:
        rgb_logo = logo.convert('RGBA')
        square.paste(rgb_logo, (x, y), rgb_logo)

    return square

def main():
    img = Image.open(LOGO_PATH).convert('RGBA')

    # 1. icon.png — 1024x1024
    icon = make_square(img, 1024, BG_COLOR)
    icon.save(os.path.join(ASSETS_DIR, 'icon.png'), 'PNG')
    print(f"  ✓ icon.png (1024x1024)")

    # 2. adaptive-icon.png — 1024x1024 with more padding (72dp safe zone ≈ 66%)
    adaptive = make_square(img, 1024, BG_COLOR)
    # Re-do with tighter fit for safe zone
    logo_safe = img.copy()
    safe_max = int(1024 * 0.66)
    logo_safe.thumbnail((safe_max, safe_max), Image.LANCZOS)
    adaptive = Image.new('RGBA', (1024, 1024), BG_COLOR + (255,))
    x = (1024 - logo_safe.width) // 2
    y = (1024 - logo_safe.height) // 2
    adaptive.paste(logo_safe, (x, y), logo_safe)
    adaptive.save(os.path.join(ASSETS_DIR, 'adaptive-icon.png'), 'PNG')
    print(f"  ✓ adaptive-icon.png (1024x1024)")

    # 3. favicon.png — 48x48
    favicon = make_square(img, 48, BG_COLOR)
    favicon.save(os.path.join(ASSETS_DIR, 'favicon.png'), 'PNG')
    print(f"  ✓ favicon.png (48x48)")

    # 4. splash.png — centered logo on dark background at splash ratio
    # Expo uses scale-to-fill for splash, so make a tall image (1242x2436 typical)
    splash_w, splash_h = 1242, 2436
    splash = Image.new('RGBA', (splash_w, splash_h), BG_COLOR + (255,))
    splash_logo = img.copy()
    splash_logo.thumbnail((splash_w * 0.45, splash_h * 0.3), Image.LANCZOS)
    x = (splash_w - splash_logo.width) // 2
    y = (splash_h - splash_logo.height) // 2
    splash.paste(splash_logo, (x, y), splash_logo)
    splash.save(os.path.join(ASSETS_DIR, 'splash.png'), 'PNG')
    print(f"  ✓ splash.png (1242x2436)")

    print(f"\nAll assets generated in {ASSETS_DIR}")

if __name__ == '__main__':
    main()
