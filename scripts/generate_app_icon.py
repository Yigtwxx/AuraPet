#!/usr/bin/env python3
"""
AuraPet iOS app icon üreteci.

Marka renkleriyle (mor diyagonal gradyan + yumuşak merkez parlaması + beyaz
"Aurion Spark" yıldızı) 1024x1024 tam-kanama bir PNG üretir. iOS köşeleri
kendisi maskeler, bu yüzden köşe yuvarlaması/şeffaflık eklenmez.

Kullanım:
    backend/.venv/bin/python scripts/generate_app_icon.py

Gerekli paketler: pillow, numpy (numpy backend .venv'inde torch ile zaten gelir).
"""
from __future__ import annotations

import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W = 1024
OUT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "mobile-ios",
        "AuraPet",
        "Resources",
        "Assets.xcassets",
        "AppIcon.appiconset",
        "icon-1024.png",
    )
)


def sparkle_points(cx: float, cy: float, outer: float, inner: float) -> list[tuple[float, float]]:
    """4 uçlu yıldız (sparkle) köşe noktaları — tepeler yukarı/sağ/aşağı/sol."""
    pts: list[tuple[float, float]] = []
    for i in range(8):
        ang = math.radians(i * 45 - 90)
        rad = outer if i % 2 == 0 else inner
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts


def main() -> None:
    # 1. Diyagonal marka gradyanı (sol-üst → sağ-alt)
    c1 = np.array([0x26, 0xA6, 0xA0], dtype=float)  # brandPrimary (petrol/teal)
    c2 = np.array([0x14, 0x5F, 0x5C], dtype=float)  # daha derin petrol
    yy, xx = np.mgrid[0:W, 0:W]
    t = ((xx + yy) / (2 * (W - 1)))[..., None]
    bg = (c1 * (1 - t) + c2 * t).astype(np.uint8)
    img = Image.fromarray(bg).convert("RGBA")

    cx = cy = W / 2.0

    # 2. Markanın arkasında yumuşak radyal parlama
    bloom = Image.new("L", (W, W), 0)
    bd = ImageDraw.Draw(bloom)
    max_r = W * 0.46
    steps = 60
    for i in range(steps, 0, -1):
        rr = max_r * i / steps
        alpha = int(95 * (1 - i / steps))
        bd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=alpha)
    bloom = bloom.filter(ImageFilter.GaussianBlur(40))
    glow_layer = Image.new("RGBA", (W, W), (237, 242, 240, 0))
    glow_layer.putalpha(bloom)
    img = Image.alpha_composite(img, glow_layer)

    # 3. Beyaz Aurion sparkle + küçük aksan yıldızı
    mark = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    md = ImageDraw.Draw(mark)
    main_r = W * 0.30
    md.polygon(sparkle_points(cx, cy, main_r, main_r * 0.17), fill=(255, 255, 255, 255))
    accent_r = W * 0.075
    md.polygon(
        sparkle_points(cx + W * 0.205, cy - W * 0.205, accent_r, accent_r * 0.2),
        fill=(255, 255, 255, 235),
    )

    # Yumuşak hale: bulanık kopyayı altına, keskin markayı üstüne yerleştir
    halo = mark.filter(ImageFilter.GaussianBlur(22))
    img = Image.alpha_composite(img, halo)
    img = Image.alpha_composite(img, mark)

    # iOS app icon'ları opak olmalı (alpha kanalı olmadan kaydet)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.convert("RGB").save(OUT, "PNG")
    print(f"✓ App icon yazıldı: {OUT}  ({W}x{W})")


if __name__ == "__main__":
    main()
