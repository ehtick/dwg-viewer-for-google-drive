<template>
  <div class="support-page">
    <div class="app-header">
      <h1>Support & Help</h1>
      <div class="header-actions">
        <router-link to="/home" class="header-link">Home</router-link>
      </div>
    </div>

    <div class="support-content">
      <p class="intro">
        Welcome to the <strong>DWG Viewer</strong> support page. Here you'll find answers to common
        questions, usage guides, and troubleshooting tips. If you need additional help, please don't hesitate to
        <a href="mailto:thingraph@outlook.com">contact us</a>.
      </p>

      <section>
        <h2>📖 Getting Started</h2>
        <h3>How to Use the Application</h3>
        <p>
          Open files from the Google Drive™ web interface using <strong>Open with</strong>.
        </p>
        <ol>
          <li>
            <strong>Open Google Drive™</strong> in your browser (drive.google.com).
          </li>
          <li>
            <strong>Right‑click</strong> a DWG or DXF file (or select it and use the “⋮” menu).
          </li>
          <li>
            <strong>Choose “Open with”</strong> → <strong>“DWG Viewer”</strong> (or the name you gave the app when installing).
          </li>
          <li>
            <strong>Sign in</strong> with Google if prompted and allow access. The file will open in the viewer.
          </li>
          <li>
            Use the toolbar to zoom, pan, measure, and annotate your drawing.
          </li>
        </ol>
      </section>

      <section>
        <h2>❓ Frequently Asked Questions (FAQ)</h2>

        <div class="faq-item">
          <h3>What file formats are supported?</h3>
          <p>
            The application supports <strong>DWG</strong> (AutoCAD Drawing) and <strong>DXF</strong> (Drawing Exchange
            Format) files. These are the standard formats for CAD drawings.
          </p>
        </div>

        <div class="faq-item">
          <h3>Do I need to install anything?</h3>
          <p>
            No installation is required! This is a web-based application that runs entirely in your browser. Just visit
            the website and start using it.
          </p>
        </div>

        <div class="faq-item">
          <h3>Is my data secure?</h3>
          <p>
            Yes. The application uses Google's OAuth 2.0 for secure authentication. File content is processed locally in
            your browser and is never sent to our servers. We only access files you explicitly open via “Open with” in Google Drive™. For more details, see our <router-link to="/privacy">Privacy Policy</router-link>.
          </p>
        </div>

        <div class="faq-item">
          <h3>What permissions does the app request?</h3>
          <p>
            The app requests <code>drive.file</code> and <code>drive.install</code> so it can appear in “Open with” and read only the files you open with it from Google Drive™. It does not browse or list your Drive. The app has read-only access and cannot modify or delete your files.
          </p>
        </div>

        <div class="faq-item">
          <h3>Can I use this offline?</h3>
          <p>
            The application requires an internet connection to authenticate with Google Drive™ and load files. However,
            once a file is loaded, you can view it without additional network requests (until you refresh the page).
          </p>
        </div>

        <div class="faq-item">
          <h3>How do I revoke access to my Google account?</h3>
          <p>
            You can revoke access at any time by visiting your
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
              Google Account permissions page
            </a>
            and removing the app from the list of connected apps.
          </p>
        </div>

        <div class="faq-item">
          <h3>Can I edit DWG/DXF files?</h3>
          <p>
            Currently, the application is a <strong>viewer only</strong>. You can view, measure, and annotate drawings,
            but you cannot edit the original file. For editing, you'll need to use a dedicated CAD application like
            AutoCAD.
          </p>
        </div>
      </section>

      <section>
        <h2>🔧 Troubleshooting</h2>

        <div class="troubleshooting-item">
          <h3>Authentication Issues</h3>
          <p><strong>Problem:</strong> Unable to connect to Google Drive™ or authentication fails.</p>
          <p><strong>Solutions:</strong></p>
          <ul>
            <li>Make sure you're using a supported browser (Chrome, Firefox, Edge, Safari)</li>
            <li>Check that third-party cookies are enabled in your browser settings</li>
            <li>Clear your browser cache and cookies, then try again</li>
            <li>Ensure you're not using an ad blocker that might interfere with Google APIs</li>
            <li>Try signing out and signing back in to your Google account</li>
          </ul>
        </div>

        <div class="troubleshooting-item">
          <h3>File Won't Load</h3>
          <p><strong>Problem:</strong> The file doesn't load or shows an error after opening with DWG Viewer.</p>
          <p><strong>Solutions:</strong></p>
          <ul>
            <li>Verify the file is a valid DWG or DXF file</li>
            <li>Check that the file isn't corrupted or password-protected</li>
            <li>Ensure you have permission to access the file in Google Drive™</li>
            <li>Try opening the file again from Drive (right‑click → Open with → DWG Viewer)</li>
            <li>For very large files, loading may take longer — please wait</li>
          </ul>
        </div>

        <div class="troubleshooting-item">
          <h3>Viewer Performance Issues</h3>
          <p><strong>Problem:</strong> Viewer is slow or unresponsive.</p>
          <p><strong>Solutions:</strong></p>
          <ul>
            <li>Large or complex drawings may take longer to render - this is normal</li>
            <li>Close other browser tabs to free up system resources</li>
            <li>Update your browser to the latest version</li>
            <li>Ensure your graphics drivers are up to date</li>
            <li>Try using a different browser to see if the issue persists</li>
          </ul>
        </div>

        <div class="troubleshooting-item">
          <h3>“Open with” Option Not Showing</h3>
          <p><strong>Problem:</strong> DWG Viewer doesn’t appear in the “Open with” menu in Google Drive™.</p>
          <p><strong>Solutions:</strong></p>
          <ul>
            <li><strong>Install the app first:</strong> If you have never used DWG Viewer with your Google account, you need to install it so it appears in the "Open with" menu. Go to the <router-link to="/install">Install</router-link> page, click <strong>Install</strong>, and sign in with Google to authorize the app. After that, DWG Viewer will show up when you right‑click DWG/DXF files in Drive.</li>
            <li>Ensure the app is installed or connected to your Google Drive™ (e.g. via your organization or the first time you opened a file with it)</li>
            <li>Right‑click a DWG or DXF file (or use the “⋮” menu on the file) and look for “Open with”</li>
            <li>Try from drive.google.com in a supported browser (Chrome, Firefox, Edge, Safari)</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>📚 Features Guide</h2>

        <div class="feature-item">
          <h3>Navigation Tools</h3>
          <ul>
            <li><strong>Zoom:</strong> Use the mouse wheel, zoom buttons, or pinch gesture on touch devices</li>
            <li><strong>Pan:</strong> Click and drag to move around the drawing</li>
            <li><strong>Fit to Screen:</strong> Click the fit button to view the entire drawing</li>
          </ul>
        </div>

        <div class="feature-item">
          <h3>Measurement Tools</h3>
          <ul>
            <li>Measure distances between points</li>
            <li>Calculate areas of closed shapes</li>
            <li>View coordinates of specific points</li>
          </ul>
        </div>

        <div class="feature-item">
          <h3>Annotation Tools</h3>
          <ul>
            <li>Add arrows, rectangles, circles, and text annotations</li>
            <li>Mark important areas or features</li>
            <li>Export annotated drawings as images</li>
          </ul>
        </div>

        <div class="feature-item">
          <h3>Layer Management</h3>
          <ul>
            <li>Show or hide specific layers</li>
            <li>Control layer visibility to focus on specific parts of the drawing</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>📧 Contact & Support</h2>
        <p>
          If you have questions, encounter issues not covered here, or would like to provide feedback, please contact us:
        </p>
        <ul>
          <li>
            <strong>Email:</strong>
            <a href="mailto:thingraph@outlook.com">thingraph@outlook.com</a>
          </li>
          <li>
            <strong>GitHub:</strong>
            <a href="https://github.com/thingraph/dwg-viewer-example" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </li>
        </ul>
        <p>
          We typically respond within 24-48 hours. For bug reports, please include:
        </p>
        <ul>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Steps to reproduce the issue</li>
          <li>Any error messages you see</li>
        </ul>
      </section>

      <section>
        <h2>📄 Additional Resources</h2>
        <ul>
          <li>
            <router-link to="/privacy">Privacy Policy</router-link> - Learn how we handle your data
          </li>
          <li>
            <router-link to="/terms">Terms of Service</router-link> - Read our terms and conditions
          </li>
          <li>
            <a href="https://developers.google.com/drive" target="_blank" rel="noopener noreferrer">
              Google Drive™ API Documentation
            </a>
            - Learn more about Google Drive™ integration
          </li>
        </ul>
      </section>

      <section class="trademark-notice">
        <p style="font-size: 12px; color: #999; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
          Google Drive™ is a trademark of Google LLC.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.support-page {
  min-height: calc(100vh - var(--footer-height, 50px));
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.app-header .header-actions {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-link {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.95;
}

.header-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.support-content {
  max-width: 800px;
  margin: 24px auto 32px;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px 48px;
}

.intro {
  margin: 0 0 24px 0;
  line-height: 1.6;
  color: #333;
}

section {
  margin-bottom: 32px;
}

section:last-child {
  margin-bottom: 0;
}

h2 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

h3 {
  margin: 20px 0 12px 0;
  font-size: 1.1rem;
  color: #444;
  font-weight: 600;
}

p {
  margin: 0 0 12px 0;
  line-height: 1.6;
  color: #555;
}

ul,
ol {
  margin: 0 0 12px 0;
  padding-left: 24px;
}

li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #555;
}

a {
  color: #409EFF;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.faq-item,
.troubleshooting-item,
.feature-item {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.faq-item h3,
.troubleshooting-item h3,
.feature-item h3 {
  margin-top: 0;
  color: #667eea;
}

.troubleshooting-item p:first-of-type {
  font-weight: 500;
  color: #333;
}

@media (max-width: 768px) {
  .support-content {
    margin-left: 12px;
    margin-right: 12px;
    padding: 24px 20px;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }

  h2 {
    font-size: 1.1rem;
  }

  h3 {
    font-size: 1rem;
  }
}
</style>

