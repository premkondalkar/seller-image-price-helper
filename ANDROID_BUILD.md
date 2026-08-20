# Android / Capacitor build

This project is now configured as a Capacitor Android application.

## 1. Requirements

- Node.js 20+
- npm
- Android Studio
- Android SDK + platform tools
- JDK 17

## 2. Install dependencies

```bash
npm install
```

## 3. Create/sync Android project

```bash
npm run cap:sync
```

This creates/updates the `android/` project from the Vite `dist/` build.

## 4. Open in Android Studio

```bash
npm run cap:open
```

Then select an emulator or connected Android phone and run the app.

## 5. Build a debug APK

```bash
npm run cap:build:apk
```

The debug APK is produced under:

`android/app/build/outputs/apk/debug/app-debug.apk`

## 6. Release APK

For a Play Store/release build, configure your own signing key in Android Studio/Gradle and use:

```bash
npm run cap:build:release
```

Do not commit signing keys or API secrets.

## AI API security

The APK contains the web application only. Never put an OpenAI or other provider secret in `VITE_*` variables. Use the existing secure backend (`server/index.js`) or deploy it separately and configure the public backend URL.

## Native behavior

The app remains functional in Demo Mode without an AI API. Existing file input supports Android photo/gallery selection. Browser APIs such as localStorage and downloads are supported inside Capacitor's WebView. Native camera/Share plugins can be added later if required, without putting secrets in the APK.

## One-command build from an Android phone

The project includes `build-apk.sh`.

After extracting the project in Termux, run:

```bash
bash build-apk.sh
```

The script installs the Node/Java prerequisites, installs npm packages, creates/synchronizes Capacitor Android files, and attempts to build the debug APK.

### Important ARM64 phone limitation

Most Android phones are ARM64. The standard Android SDK/Gradle toolchain is not a reliably native ARM64 build environment in plain Termux, so the script intentionally detects ARM64 and stops rather than pretending it can build an APK locally.

For ARM64 phones, use the **GitHub Actions phone-only build** documented below. The phone controls the build from GitHub and then downloads the generated APK; no PC is required.

### Phone-only GitHub Actions build

1. Upload this project to a GitHub repository from your phone.
2. Add the workflow in `.github/workflows/android-apk.yml`.
3. Open the repository's **Actions** tab on your phone.
4. Run **Build Android APK**.
5. Download the `seller-image-price-helper-debug-apk` artifact.

This is the recommended mobile-only route because the APK is built on a standard Linux Android build runner rather than trying to run x86 Android build binaries on an ARM phone.
