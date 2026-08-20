#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Seller Image & Price Helper - one-command Android build helper for Termux.
# Usage on a phone after extracting the project:
#   bash build-apk.sh
#
# This script prepares the JS dependencies and Capacitor project, then builds
# a debug APK when the phone can run the Android/Gradle toolchain.

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

log() { printf '\n==> %s\n' "$1"; }
fail() { printf '\nERROR: %s\n' "$1" >&2; exit 1; }

[ -f package.json ] || fail "Run this script from the extracted project folder."

if [ -z "${TERMUX_VERSION:-}" ]; then
  printf 'This script is designed for Termux on Android.\n'
  printf 'If you are already using Termux, continue by setting TERMUX_VERSION manually only if appropriate.\n'
fi

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) : ;;
  aarch64|arm64)
    cat >&2 <<'MSG'

This phone is ARM64 (the normal Android phone architecture).
The official Android SDK/Build-Tools and some Gradle native binaries are
published primarily for Linux x86_64, so a completely native APK build
inside plain Termux is not reliably supported.

Your app itself is mobile-ready. For a guaranteed phone-only workflow,
use the GitHub Actions build described in ANDROID_BUILD.md; the phone only
needs a browser/GitHub account and the APK is produced remotely.
MSG
    exit 2
    ;;
  *)
    fail "Unsupported CPU architecture: $ARCH"
    ;;
esac

command -v pkg >/dev/null 2>&1 || fail "Termux package manager (pkg) was not found. Install Termux first."

log "Installing Termux build prerequisites"
pkg update -y
pkg install -y nodejs-lts git wget unzip openjdk-17

command -v node >/dev/null || fail "Node.js installation failed."
command -v java >/dev/null || fail "Java installation failed."

log "Installing JavaScript dependencies"
npm install

log "Checking Capacitor"
npx cap --version >/dev/null

log "Creating/synchronizing Android project"
npm run cap:sync

[ -d android ] || fail "Capacitor did not create the android/ directory."
[ -x android/gradlew ] || chmod +x android/gradlew

log "Building debug APK"
cd android
./gradlew assembleDebug --no-daemon

APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
[ -f "$APK" ] || fail "Gradle finished without producing app-debug.apk."

log "APK created"
printf '%s\n' "$APK"
printf '\nYou can install it with:\n  termux-open "$APK"\n'
