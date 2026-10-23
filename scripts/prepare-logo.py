#!/usr/bin/env python3
"""Prepare an official logo file for a brand preset.

Makes the logo's flat white/near-white background transparent (only the
background connected to the edges, so white inside the artwork stays),
trims the empty margin, and writes the app icons.

Usage:
  python3 scripts/prepare-logo.py SOURCE BRAND_ID [--keep-bg] [--crop-bottom-gap]

Writes into public/brands/BRAND_ID/:
  logo.png                 trimmed logo, transparent background
  icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
                           the logo centered on white (the app's home-screen icon)

Never redraw or recolor a logo. This only removes the box behind it.
Needs: pip install pillow scipy numpy
"""
import argparse, os
import numpy as np
from PIL import Image
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument('source')
ap.add_argument('brand_id')
ap.add_argument('--keep-bg', action='store_true', help='leave the background as is')
ap.add_argument('--tolerance', type=int, default=20, help='how close to white counts as background (0-255)')
ap.add_argument('--crop-bottom-gap', action='store_true',
                help='cut off everything below the largest blank band in the lower half (drops a baked-in tagline)')
a = ap.parse_args()

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'brands', a.brand_id)
os.makedirs(out, exist_ok=True)

im = Image.open(a.source).convert('RGBA')
px = np.array(im).astype(np.int16)
rgb, alpha = px[..., :3], px[..., 3]

if not a.keep_bg:
    nearwhite = (rgb.min(axis=2) >= 255 - a.tolerance) & (np.ptp(rgb, axis=2) <= a.tolerance)
    bg = nearwhite | (alpha < 8)
    lab, _ = ndimage.label(bg)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    mask = np.isin(lab, list(edge))
    # soften the cut edge one pixel so anti-aliasing doesn't leave a halo
    ring = ndimage.binary_dilation(mask) & ~mask
    px[..., 3] = np.where(mask, 0, px[..., 3])
    px[..., 3] = np.where(ring, (px[..., 3] * 0.6).astype(np.int16), px[..., 3])

im = Image.fromarray(px.clip(0, 255).astype(np.uint8), 'RGBA')

if a.crop_bottom_gap:
    ink = (np.array(im)[..., 3] > 40).sum(axis=1)
    h = len(ink)
    best, start, run_s = (0, None), None, None
    for y in range(h // 2, h):
        if ink[y] == 0:
            run_s = y if run_s is None else run_s
            if y - run_s + 1 > best[0]:
                best = (y - run_s + 1, run_s)
        else:
            run_s = None
    if best[1]:
        im = im.crop((0, 0, im.width, best[1]))

bbox = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
im = im.crop(bbox)
pad = max(2, int(max(im.size) * 0.02))
canvas = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
canvas.paste(im, (pad, pad), im)
if canvas.width > 900:
    canvas = canvas.resize((900, round(canvas.height * 900 / canvas.width)), Image.LANCZOS)
canvas.save(os.path.join(out, 'logo.png'), optimize=True)

def icon(size, inner, name):
    sq = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    lg = canvas.copy()
    lg.thumbnail((int(size * inner), int(size * inner)), Image.LANCZOS)
    sq.paste(lg, ((size - lg.width) // 2, (size - lg.height) // 2), lg)
    sq.convert('RGB').save(os.path.join(out, name), optimize=True)

icon(192, 0.86, 'icon-192.png')
icon(512, 0.86, 'icon-512.png')
icon(512, 0.66, 'icon-maskable-512.png')   # maskable icons get cropped to a circle
icon(180, 0.86, 'apple-touch-icon.png')
print(f'{a.brand_id}: logo {canvas.size} -> {os.path.normpath(out)}')
