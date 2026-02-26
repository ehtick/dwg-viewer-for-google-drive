# DWG Viewer for Google Drive™

A web application that lets you view DWG/DXF files from Google Drive™. In the Google Drive™ web interface, right‑click a DWG or DXF file and choose **Open with** → **DWG Viewer** to open and view the file in the browser.

## Supported File Formats

- **DWG** - AutoCAD Drawing files
- **DXF** - Drawing Exchange Format

## Features

- 🎨 **2D CAD Viewer**: High-performance WebGL-based viewer for DWG/DXF files
- 📏 **Measurement Tools**: Measure distance, area, angle, and coordinates
- ✏️ **Markup & Annotation**: Add arrows, rectangles, circles, text, and other annotations
- 📑 **Layer Management**: Show/hide layers and manage layer visibility
- 📸 **Screenshot**: Capture and export high-quality images of drawings
- ⚙️ **Settings Panel**: Customize viewer settings and preferences
- 🎛️ **Interactive Toolbar**: Easy access to all viewer tools and features
- 🔄 **Layout Switching**: Switch between different layouts in multi-layout drawings
- 🎯 **Navigation Tools**: Zoom, pan, rotate with axis gizmo and bottom bar controls

## Installation

```bash
npm install
# or
pnpm install
```

## Configuration

### Google API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**:
   - Enable **Google Drive™ API**
   - Enable **Google Identity Services** (for OAuth)

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID (for web application authentication)
   - Create API Key (for Drive API calls)
   - For API Key restrictions:
     - Application restrictions: HTTP referrers (web sites)
     - Add your domain (e.g., `localhost:5173` for development, your production domain)
     - API restrictions: Restrict to "Google Drive™ API"

4. **Set Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_GOOGLE_API_KEY=your-api-key
   ```
   - **Recommended: Firebase redirect sign-in** (no popup, no custom backend; works in iframes and for review).  
     In [Firebase Console](https://console.firebase.google.com/) create a project → enable **Authentication** → add **Google** sign-in → copy the web app config from project settings and add to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=...
   ```
   Firebase handles redirect and token issuance; this app only integrates on the frontend.  
   If you see `auth/configuration not found`: in Firebase Console go to **Authentication** → **Sign-in method** → open **Google** → turn **Enable** on → **Save**.
   - **Optional: popup-only sign-in** (requires allowing popups): set `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com` when not using Firebase.

5. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Configure the consent screen
   - Add scopes:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/drive.install`

## Development

Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application:
```bash
npm run build
# or
pnpm build
```

Preview the production build:
```bash
npm run preview
# or
pnpm preview
```

## Usage

1. **Open Google Drive™** in your browser (drive.google.com).
2. **Right‑click** a DWG or DXF file (or select it and use the “⋮” menu).
3. **Choose “Open with”** → **“DWG Viewer”** (or the name you gave the app when installing).
4. **Sign in** with Google if prompted and allow access.
5. The file opens in the DWG Viewer; use the toolbar to zoom, pan, measure, and annotate.

## API Permissions

The application requests the following Google Drive™ permissions:

- `https://www.googleapis.com/auth/drive.file` – Access to files you open with the app from Google Drive™
- `https://www.googleapis.com/auth/drive.install` – Connect the app to Google Drive™ so it appears in “Open with”

**Note**: The app can only read files that you open via **Open with** in Google Drive™. It does not browse or list your Drive.

## Security

- Authentication is handled via Google OAuth 2.0
- API credentials are stored as environment variables
- The app uses `drive.file` and `drive.install` only for “Open with” and reading the opened file
- File content is not stored on our servers or sent to third parties

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

### Development Issues

- If you encounter TypeScript errors related to Google APIs, ensure the type declarations are properly loaded
- For build issues, try clearing the cache: `npm run clean && npm install`

## License

MIT License - see the main project LICENSE file for details.

## Acknowledgments

- [Element Plus](https://element-plus.org/) - Vue 3 UI framework
- [Google Drive™ API](https://developers.google.com/drive) - Google Drive™ integration

---

**Trademark Notice**: Google Drive™ is a trademark of Google LLC.