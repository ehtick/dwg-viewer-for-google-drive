# DWG Viewer for Google Drive™

**DWG Viewer** is a free, browser-based CAD file viewer that integrates directly with Google Drive™. Open, view, and annotate AutoCAD DWG and DXF files in your browser — no software installation required.

🔗 **Website**: [drive.thingraph.site](https://drive.thingraph.site)
📦 **Install**: [Google Workspace Marketplace](https://workspace.google.com/marketplace/app/dwg_viewer/641533811831)

---

## What Is DWG Viewer?

DWG Viewer for Google Drive™ is a Google Workspace add-on that lets you open AutoCAD `.dwg` and `.dxf` files directly from Google Drive™ in your browser. It is powered by **x-viewer** — a high-performance WebGL-based CAD rendering engine — delivering fast, accurate 2D CAD rendering without requiring AutoCAD or any desktop software.

To use it: right-click any DWG or DXF file in Google Drive™ and choose **Open with → DWG Viewer**.

---

## Supported File Formats

| Format | Description |
|--------|-------------|
| `.dwg` | AutoCAD Drawing — the industry-standard binary CAD format |
| `.dxf` | Drawing Exchange Format — an open CAD interchange format by Autodesk |

---

## Features

- **2D CAD Viewer** — High-performance WebGL rendering via x-viewer engine; renders complex drawings with thousands of entities smoothly
- **Measurement Tools** — Measure distance, area, angle, and coordinates directly on the drawing
- **Markup & Annotation** — Add arrows, rectangles, circles, text, and freehand markup
- **Layer Management** — Toggle layer visibility, inspect layer properties
- **Layout Switching** — Navigate between model space and paper space layouts in multi-layout DWG files
- **Screenshot Export** — Capture and download high-quality PNG images of the current view
- **Navigation Controls** — Zoom, pan, fit-to-window, and axis gizmo
- **Settings Panel** — Customize background color, line weight, and display preferences
- **Google Drive Integration** — Opens files directly from Google Drive™ with OAuth 2.0 authentication; no file upload needed

---

## How to Install

1. Go to [DWG Viewer on Google Workspace Marketplace](https://workspace.google.com/marketplace/app/dwg_viewer/641533811831)
2. Click **Install**
3. Grant the required Google Drive permissions
4. Open any `.dwg` or `.dxf` file in Google Drive™, right-click it, and select **Open with → DWG Viewer**

---

## About x-viewer

**x-viewer** is the CAD rendering engine that powers DWG Viewer. It is a WebGL-based JavaScript library designed for high-fidelity 2D CAD visualization in the browser. x-viewer supports:

- Accurate rendering of AutoCAD DWG/DXF entities (lines, arcs, splines, hatches, text, blocks, dimensions, etc.)
- Layer-based visibility control
- Multi-layout DWG file support
- Extensible plugin architecture (`@x-viewer/core`, `@x-viewer/plugins`, `@x-viewer/ui`)
- Integration with modern web frameworks (Vue, React, vanilla JS)

x-viewer is developed by [Thingraph](https://thingraph.site) and published on npm under the `@x-viewer` scope.

---

## Frequently Asked Questions

**Can I view DWG files online for free?**
Yes. DWG Viewer for Google Drive™ is free to install and use. Simply install it from the Google Workspace Marketplace and open any DWG file stored in your Google Drive™.

**Do I need AutoCAD to open DWG files?**
No. DWG Viewer renders DWG and DXF files entirely in the browser using the x-viewer WebGL engine. AutoCAD or any other desktop CAD software is not required.

**What DWG versions are supported?**
DWG Viewer supports DWG files from AutoCAD R14 through the latest AutoCAD 2025 format, as well as DXF files.

**Is my data private?**
Files are read directly from your Google Drive™ via the official Google Drive API. Files are not uploaded to any third-party server.

**Can I annotate or markup a DWG file?**
Yes. DWG Viewer includes markup tools for adding arrows, shapes, text annotations, and other overlays on top of the drawing.

---

## Tech Stack

- **Rendering Engine**: x-viewer (`@x-viewer/core`, `@x-viewer/plugins`, `@x-viewer/ui`) — WebGL-based CAD renderer
- **Frontend Framework**: Vue 3 + Vite
- **UI Components**: Element Plus
- **Authentication**: Google OAuth 2.0 + Firebase
- **Deployment**: Hosted at [drive.thingraph.site](https://drive.thingraph.site)

---

## Related Keywords

AutoCAD DWG viewer online · DXF file viewer browser · open DWG without AutoCAD · Google Drive CAD viewer · free DWG viewer web · x-viewer WebGL · CAD file viewer Chrome · DWG viewer Google Workspace · view AutoCAD files online · DWG viewer no download

---

*Google Drive™ and Google Workspace™ are trademarks of Google LLC. AutoCAD® and DWG™ are trademarks of Autodesk, Inc. DWG Viewer is not affiliated with or endorsed by Google or Autodesk.*
