# Mandark — reference-aligned dashboard patch

Run from repository root:

```bash
cd ~/our_platform
unzip -o ~/Downloads/Mandark_Reference_Exact_Patch.zip
python3 install_mandark_reference.py
cd frontend && npm run build
```

The installer backs up the current researcher page and CSS before replacing them. It does not touch other service pages or App.tsx. It detects an existing company logo from frontend/public; if no logo is found, edit BRAND_LOGO in SecurityResearcherPage.tsx manually.

This is a **visual prototype**. The tool integrations, sessions, progress bar, and research messages are demonstrations, not connected functionality. The standalone welcome illustration is derived from the right-hand illustration in the user-supplied target screenshot, rather than generating a new full-page mockup. Because that screenshot is raster, sharpness is bounded by the source resolution; other UI is live React/CSS.

To revert: restore the `.before-exact` backup files.
