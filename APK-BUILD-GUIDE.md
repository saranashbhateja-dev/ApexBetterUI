# Apex OS — Android APK build

## Build automatically with GitHub Actions

1. Extract this project and create a GitHub repository for it.
2. Upload the **contents of the `Apex OS` folder** to the repository root (so `.github/workflows/build-apk.yml` is at the repository root).
3. Push to the `main` branch, or open **GitHub → Actions → Build Apex OS APK → Run workflow**.
4. Wait for the workflow to finish successfully.
5. Open the completed workflow run and download the `Apex-OS-debug-apk` artifact.
6. Extract the artifact ZIP and install `app-debug.apk` on an Android device. If Android blocks installation, allow installation from the file manager used to open the APK.

## Build locally on Windows

Requirements: Node.js 22+, Android Studio/Android SDK, and a working Java 21 installation.

1. Run `android-build.bat`.
2. The debug APK will be created at:
   `android\\app\\build\\outputs\\apk\\debug\\app-debug.apk`

## Important limitations

- This workflow packages the frontend in a Capacitor Android WebView. It does **not** package the Node.js `server.cjs` backend into the APK.
- Features that call server-only routes (for example, the server-side AI Research Lab gateway) require a separately hosted backend and may not work inside the APK until configured for a reachable HTTPS endpoint.
- Supabase workspace sync remains dependent on the existing project configuration and network access. Test pairing/sync on the target device.
- The workflow creates a **debug APK**, not a Play Store-signed release APK.
- No APK is prebuilt in this ZIP. GitHub Actions builds it and attaches it to the workflow run as an artifact.
