from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import subprocess
import threading
import urllib.request
import json
import uuid
import os
import re
import shutil
import signal
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("/var/log/buildapk.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("buildapk")

app = FastAPI()

BUILD_TOKEN = "dfff10ac14381643b517d122d109509f3a0924db82197904da629cedd31886f4"

BUILDS_DIR = "/tmp/builds"
APKS_DIR = "/tmp/apks"
os.makedirs(BUILDS_DIR, exist_ok=True)
os.makedirs(APKS_DIR, exist_ok=True)

active_builds: Dict[int, Dict[str, Any]] = {}
active_builds_lock = threading.Lock()


class BuildRequest(BaseModel):
    build_id: int
    site_url: str
    app_name: str
    package_name: Optional[str] = None
    callback_url: Optional[str] = None
    icon_url: Optional[str] = None
    splash_color: Optional[str] = "#000000"
    theme_color: Optional[str] = "#ef4444"
    push_enabled: bool = False
    offline_enabled: bool = False
    push_provider: Optional[str] = "firebase"
    fcm_server_key: Optional[str] = None
    onesignal_app_id: Optional[str] = None
    onesignal_rest_api_key: Optional[str] = None
    notification_icon_set: Optional[str] = "lucide"
    notification_icon_name: Optional[str] = "Bell"
    addon_ids: List[str] = []
    screenshot_disabled: bool = False
    app_lock_enabled: bool = False
    web_auth_enabled: bool = False
    config: Dict[str, Any] = {}


def sanitize_package(package_name: Optional[str], build_id: int) -> str:
    if package_name and re.match(r'^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$', package_name):
        return package_name
    return f"com.buildapk.app{build_id}"


def xml_escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def java_str(value: str) -> str:
    return json.dumps(value or "")


def color_or(value: Optional[str], default: str) -> str:
    if value and re.match(r'^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{8}$', value):
        return value
    return default


DEFAULT_ICON_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)

MIPMAP_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def write_default_icon(res_dir: str):
    import base64

    data = base64.b64decode(DEFAULT_ICON_B64)
    for folder in MIPMAP_SIZES:
        out_dir = os.path.join(res_dir, folder)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "ic_launcher.png"), "wb") as f:
            f.write(data)
        with open(os.path.join(out_dir, "ic_launcher_round.png"), "wb") as f:
            f.write(data)


def download_icon(icon_url: str, res_dir: str) -> bool:
    try:
        req = urllib.request.Request(icon_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
        if not data:
            return False

        try:
            from PIL import Image
            import io

            img = Image.open(io.BytesIO(data)).convert("RGBA")
            for folder, size in MIPMAP_SIZES.items():
                out_dir = os.path.join(res_dir, folder)
                os.makedirs(out_dir, exist_ok=True)
                resized = img.resize((size, size), Image.LANCZOS)
                resized.save(os.path.join(out_dir, "ic_launcher.png"))
                resized.save(os.path.join(out_dir, "ic_launcher_round.png"))
            return True
        except ImportError:
            for folder in MIPMAP_SIZES:
                out_dir = os.path.join(res_dir, folder)
                os.makedirs(out_dir, exist_ok=True)
                with open(os.path.join(out_dir, "ic_launcher.png"), "wb") as f:
                    f.write(data)
                with open(os.path.join(out_dir, "ic_launcher_round.png"), "wb") as f:
                    f.write(data)
            return True
    except Exception:
        return False


def generate_project(work_dir: str, package_name: str, app_name: str, site_url: str, req: BuildRequest):
    cfg = req.config or {}

    def cfg_bool(key, default=False):
        return bool(cfg.get(key, default))

    perm_camera = cfg_bool("permCamera")
    perm_location = cfg_bool("permLocation")
    perm_media = cfg_bool("permMedia")
    perm_vibration = cfg_bool("permVibration")
    perm_microphone = cfg_bool("permMicrophone")
    pinch_zoom = cfg_bool("pinchZoom")
    allow_http = cfg_bool("allowHttp")
    disable_cache = cfg_bool("disableCache")
    fullscreen = cfg_bool("fullscreen")
    deep_links = cfg_bool("deepLinks")
    js_bridge = cfg_bool("jsBridge")
    web_auth = req.web_auth_enabled or cfg_bool("webAuth")
    screenshot_disabled = req.screenshot_disabled or cfg_bool("screenshotDisabled")
    app_lock = req.app_lock_enabled or cfg_bool("appLockEnabled")
    offline_enabled = req.offline_enabled or cfg_bool("offlineEnabled")
    push_enabled = req.push_enabled or cfg_bool("pushEnabled")
    push_provider = (req.push_provider or cfg.get("pushProvider") or "onesignal").lower()
    onesignal_app_id = req.onesignal_app_id or cfg.get("oneSignalAppId")
    user_agent = cfg.get("userAgent") or ""
    custom_js = cfg.get("customJs") or ""
    custom_css = cfg.get("customCss") or ""
    url_scheme = cfg.get("urlScheme") or ""
    orientation_raw = (cfg.get("orientation") or "unspecified").lower()
    orientation = orientation_raw if orientation_raw in ("portrait", "landscape") else "unspecified"
    version_code = str(cfg.get("versionCode") or "1")
    version_name = str(cfg.get("versionName") or "1.0")
    theme_color = color_or(req.theme_color, "#EF4444")
    splash_color = color_or(req.splash_color, "#000000")
    status_bar_color = color_or(cfg.get("statusBarColor"), theme_color)
    nav_bar_color = color_or(cfg.get("navBarColor"), "#FFFFFF")

    package_path = package_name.replace(".", "/")
    java_dir = os.path.join(work_dir, "app", "src", "main", "java", package_path)
    res_dir = os.path.join(work_dir, "app", "src", "main", "res")
    assets_dir = os.path.join(work_dir, "app", "src", "main", "assets")
    os.makedirs(java_dir, exist_ok=True)
    os.makedirs(res_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(os.path.join(res_dir, "values"), exist_ok=True)
    os.makedirs(os.path.join(res_dir, "drawable"), exist_ok=True)
    os.makedirs(os.path.join(res_dir, "xml"), exist_ok=True)

    with open(os.path.join(work_dir, "settings.gradle"), "w") as f:
        f.write("include ':app'\nrootProject.name = 'GeneratedApp'\n")

    with open(os.path.join(work_dir, "build.gradle"), "w") as f:
        f.write(
            "buildscript {\n"
            "    repositories { google(); mavenCentral() }\n"
            "    dependencies { classpath 'com.android.tools.build:gradle:8.3.2' }\n"
            "}\n"
            "allprojects {\n"
            "    repositories { google(); mavenCentral() }\n"
            "}\n"
        )

    with open(os.path.join(work_dir, "gradle.properties"), "w") as f:
        f.write("android.useAndroidX=true\norg.gradle.jvmargs=-Xmx2048m\n")

    dependencies = [
        "implementation 'androidx.appcompat:appcompat:1.6.1'",
        "implementation 'androidx.webkit:webkit:1.9.0'",
    ]
    if app_lock:
        dependencies.append("implementation 'androidx.biometric:biometric:1.1.0'")
    if push_enabled and push_provider == "onesignal" and onesignal_app_id:
        dependencies.append("implementation 'com.onesignal:OneSignal:[4.0.0, 4.99.99]'")

    with open(os.path.join(work_dir, "app", "build.gradle"), "w") as f:
        f.write(
            "apply plugin: 'com.android.application'\n\n"
            "android {\n"
            f"    namespace '{package_name}'\n"
            "    compileSdk 34\n\n"
            "    defaultConfig {\n"
            f'        applicationId "{package_name}"\n'
            "        minSdk 24\n"
            "        targetSdk 34\n"
            f"        versionCode {version_code if version_code.isdigit() else '1'}\n"
            f'        versionName "{version_name}"\n'
            "    }\n"
            "    buildTypes {\n"
            "        debug { minifyEnabled false }\n"
            "    }\n"
            "    compileOptions {\n"
            "        sourceCompatibility JavaVersion.VERSION_1_8\n"
            "        targetCompatibility JavaVersion.VERSION_1_8\n"
            "    }\n"
            "}\n\n"
            "dependencies {\n"
            + "\n".join(f"    {d}" for d in dependencies)
            + "\n}\n"
        )

    permissions = ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"]
    if perm_camera:
        permissions.append("android.permission.CAMERA")
    if perm_location:
        permissions += ["android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"]
    if perm_media:
        permissions += ["android.permission.READ_EXTERNAL_STORAGE"]
    if perm_vibration:
        permissions.append("android.permission.VIBRATE")
    if perm_microphone:
        permissions.append("android.permission.RECORD_AUDIO")
    if push_enabled:
        permissions.append("android.permission.POST_NOTIFICATIONS")
    permissions = sorted(set(permissions))

    launcher_activity = "LockActivity" if app_lock else "MainActivity"
    application_name = ".App" if (push_enabled and push_provider == "onesignal" and onesignal_app_id) else None

    manifest = ['<?xml version="1.0" encoding="utf-8"?>']
    manifest.append('<manifest xmlns:android="http://schemas.android.com/apk/res/android">')
    for p in permissions:
        manifest.append(f'    <uses-permission android:name="{p}" />')
    if perm_camera:
        manifest.append('    <uses-feature android:name="android.hardware.camera" android:required="false" />')
    if perm_microphone:
        manifest.append('    <uses-feature android:name="android.hardware.microphone" android:required="false" />')

    app_attrs = [
        'android:allowBackup="true"',
        f'android:label="{xml_escape(app_name)}"',
        'android:icon="@mipmap/ic_launcher"',
        'android:theme="@style/AppTheme"',
    ]
    if allow_http:
        app_attrs.append('android:usesCleartextTraffic="true"')
    if application_name:
        app_attrs.append(f'android:name="{application_name}"')

    manifest.append("    <application")
    for a in app_attrs:
        manifest.append(f"        {a}")
    manifest.append("        >")

    manifest.append(f'        <activity android:name=".{launcher_activity}" android:exported="true" android:screenOrientation="{orientation}">')
    manifest.append("            <intent-filter>")
    manifest.append('                <action android:name="android.intent.action.MAIN" />')
    manifest.append('                <category android:name="android.intent.category.LAUNCHER" />')
    manifest.append("            </intent-filter>")
    if deep_links and url_scheme:
        manifest.append("            <intent-filter>")
        manifest.append('                <action android:name="android.intent.action.VIEW" />')
        manifest.append('                <category android:name="android.intent.category.DEFAULT" />')
        manifest.append('                <category android:name="android.intent.category.BROWSABLE" />')
        manifest.append(f'                <data android:scheme="{xml_escape(url_scheme)}" />')
        manifest.append("            </intent-filter>")
    manifest.append("        </activity>")

    if app_lock:
        manifest.append('        <activity android:name=".MainActivity" android:exported="false" />')

    if perm_camera or perm_media:
        manifest.append('        <provider')
        manifest.append(f'            android:name="androidx.core.content.FileProvider"')
        manifest.append(f'            android:authorities="{package_name}.fileprovider"')
        manifest.append('            android:exported="false"')
        manifest.append('            android:grantUriPermissions="true">')
        manifest.append('            <meta-data')
        manifest.append('                android:name="android.support.FILE_PROVIDER_PATHS"')
        manifest.append('                android:resource="@xml/file_paths" />')
        manifest.append('        </provider>')

    manifest.append("    </application>")
    manifest.append("</manifest>")

    with open(os.path.join(java_dir, "..", "..", "..", "..", "AndroidManifest.xml"), "w") as f:
        pass
    with open(os.path.join(work_dir, "app", "src", "main", "AndroidManifest.xml"), "w") as f:
        f.write("\n".join(manifest) + "\n")

    with open(os.path.join(res_dir, "xml", "file_paths.xml"), "w") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<paths xmlns:android="http://schemas.android.com/apk/res/android">\n'
            '    <external-cache-path name="captured" path="." />\n'
            '    <cache-path name="cache" path="." />\n'
            "</paths>\n"
        )

    with open(os.path.join(res_dir, "values", "colors.xml"), "w") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            f'    <color name="theme_color">{theme_color}</color>\n'
            f'    <color name="splash_color">{splash_color}</color>\n'
            f'    <color name="status_bar_color">{status_bar_color}</color>\n'
            f'    <color name="nav_bar_color">{nav_bar_color}</color>\n'
            "</resources>\n"
        )

    with open(os.path.join(res_dir, "values", "styles.xml"), "w") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            '    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">\n'
            '        <item name="android:statusBarColor">@color/status_bar_color</item>\n'
            '        <item name="android:navigationBarColor">@color/nav_bar_color</item>\n'
            "    </style>\n"
            '    <style name="SplashTheme" parent="android:Theme.Material.Light.NoActionBar">\n'
            '        <item name="android:windowBackground">@drawable/splash_background</item>\n'
            '        <item name="android:statusBarColor">@color/splash_color</item>\n'
            "    </style>\n"
            "</resources>\n"
        )

    with open(os.path.join(res_dir, "drawable", "splash_background.xml"), "w") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n'
            '    <item android:drawable="@color/splash_color" />\n'
            "</layer-list>\n"
        )

    icon_ok = False
    if req.icon_url:
        icon_ok = download_icon(req.icon_url, res_dir)
    if not icon_ok:
        write_default_icon(res_dir)

    if offline_enabled:
        with open(os.path.join(assets_dir, "offline.html"), "w") as f:
            f.write(
                "<html><body style='display:flex;align-items:center;justify-content:center;"
                "height:100vh;font-family:sans-serif;text-align:center;'>"
                "<div><h2>Нет подключения к интернету</h2>"
                "<p>Проверьте соединение и попробуйте снова</p></div></body></html>"
            )

    safe_url = json.dumps(site_url)
    cache_mode = "WebSettings.LOAD_CACHE_ELSE_NETWORK" if offline_enabled and not disable_cache else "WebSettings.LOAD_DEFAULT"
    mixed_content = "WebSettings.MIXED_CONTENT_ALWAYS_ALLOW" if allow_http else "WebSettings.MIXED_CONTENT_NEVER_ALLOW"

    main_activity = f"""package {package_name};

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.IOException;

public class MainActivity extends Activity {{
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private String cameraPhotoPath;
    private PermissionRequest pendingPermissionRequest;
    private static final int FILE_CHOOSER_RESULT = 2001;
    private static final int WEB_MEDIA_PERMISSION_RESULT = 2002;

    @Override
    protected void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);

        if ({str(screenshot_disabled).lower()}) {{
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
        }}
        if ({str(fullscreen).lower()}) {{
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }}

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode({cache_mode});
        settings.setSupportZoom({str(pinch_zoom).lower()});
        settings.setBuiltInZoomControls({str(pinch_zoom).lower()});
        settings.setDisplayZoomControls(false);
        settings.setMixedContentMode({mixed_content});
        settings.setAllowFileAccess(true);
        settings.setDomStorageEnabled(true);

        String customUserAgent = {java_str(user_agent)};
        if (!customUserAgent.isEmpty()) {{
            settings.setUserAgentString(customUserAgent);
        }}

        if ({str(web_auth).lower()}) {{
            CookieManager.getInstance().setAcceptCookie(true);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }}

        final String customJs = {java_str(custom_js)};
        final String customCss = {java_str(custom_css)};
        final boolean offlineEnabled = {str(offline_enabled).lower()};

        webView.setWebViewClient(new WebViewClient() {{
            @Override
            public void onPageFinished(WebView view, String url) {{
                super.onPageFinished(view, url);
                if (!customJs.isEmpty()) {{
                    view.evaluateJavascript(customJs, null);
                }}
                if (!customCss.isEmpty()) {{
                    String js = "(function(){{var s=document.createElement('style');s.innerHTML=" +
                        android.text.TextUtils.htmlEncode(customCss).replace("\\n", " ") + ";}})();";
                }}
            }}

            @Override
            public void onReceivedError(WebView view, android.webkit.WebResourceRequest request, android.webkit.WebResourceError error) {{
                super.onReceivedError(view, request, error);
                if (offlineEnabled && !isNetworkAvailable()) {{
                    view.loadUrl("file:///android_asset/offline.html");
                }}
            }}
        }});

        webView.setWebChromeClient(new WebChromeClient() {{
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {{
                boolean granted = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
                callback.invoke(origin, granted, false);
            }}

            @Override
            public void onPermissionRequest(final PermissionRequest request) {{
                runOnUiThread(() -> {{
                    boolean micGrantedByOs = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
                    boolean camGrantedByOs = ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
                    java.util.List<String> needed = new java.util.ArrayList<>();
                    java.util.List<String> allowed = new java.util.ArrayList<>();
                    for (String resource : request.getResources()) {{
                        if (resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE) && {str(perm_microphone).lower()}) {{
                            allowed.add(resource);
                            if (!micGrantedByOs) needed.add(Manifest.permission.RECORD_AUDIO);
                        }} else if (resource.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE) && {str(perm_camera).lower()}) {{
                            allowed.add(resource);
                            if (!camGrantedByOs) needed.add(Manifest.permission.CAMERA);
                        }} else if (!resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE) && !resource.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {{
                            allowed.add(resource);
                        }}
                    }}
                    if (!needed.isEmpty()) {{
                        pendingPermissionRequest = request;
                        ActivityCompat.requestPermissions(MainActivity.this, needed.toArray(new String[0]), WEB_MEDIA_PERMISSION_RESULT);
                        return;
                    }}
                    if (!allowed.isEmpty()) {{
                        request.grant(allowed.toArray(new String[0]));
                    }} else {{
                        request.deny();
                    }}
                }});
            }}

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {{
                filePathCallback = callback;
                Intent contentIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentIntent.setType("*/*");
                Intent chooser = Intent.createChooser(contentIntent, "Выбрать файл");
                try {{
                    startActivityForResult(chooser, FILE_CHOOSER_RESULT);
                }} catch (Exception e) {{
                    filePathCallback = null;
                    return false;
                }}
                return true;
            }}
        }});

        {{}}
        if ({str(perm_camera).lower()} || {str(perm_location).lower()} || {str(perm_media).lower()} || {str(perm_microphone).lower()}) {{
            requestRuntimePermissions();
        }}

        Uri deepData = getIntent() != null ? getIntent().getData() : null;
        if (deepData != null) {{
            webView.loadUrl(deepData.toString());
        }} else {{
            webView.loadUrl({safe_url});
        }}
        setContentView(webView);
    }}

    private void requestRuntimePermissions() {{
        java.util.List<String> perms = new java.util.ArrayList<>();
        if ({str(perm_camera).lower()}) perms.add(Manifest.permission.CAMERA);
        if ({str(perm_location).lower()}) {{
            perms.add(Manifest.permission.ACCESS_FINE_LOCATION);
            perms.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }}
        if ({str(perm_media).lower()}) perms.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        if ({str(perm_microphone).lower()}) perms.add(Manifest.permission.RECORD_AUDIO);
        if (!perms.isEmpty()) {{
            ActivityCompat.requestPermissions(this, perms.toArray(new String[0]), 1001);
        }}
    }}

    private boolean isNetworkAvailable() {{
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo info = cm != null ? cm.getActiveNetworkInfo() : null;
        return info != null && info.isConnected();
    }}

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {{
        if (requestCode == FILE_CHOOSER_RESULT) {{
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) {{
                results = new Uri[]{{data.getData()}};
            }}
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }} else {{
            super.onActivityResult(requestCode, resultCode, data);
        }}
    }}

    @Override
    public void onBackPressed() {{
        if (webView != null && webView.canGoBack()) {{
            webView.goBack();
        }} else {{
            super.onBackPressed();
        }}
    }}

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {{
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == WEB_MEDIA_PERMISSION_RESULT) {{
            if (pendingPermissionRequest == null) return;
            boolean allGranted = true;
            for (int result : grantResults) {{
                if (result != PackageManager.PERMISSION_GRANTED) {{
                    allGranted = false;
                    break;
                }}
            }}
            if (allGranted) {{
                pendingPermissionRequest.grant(pendingPermissionRequest.getResources());
            }} else {{
                pendingPermissionRequest.deny();
            }}
            pendingPermissionRequest = null;
        }}
    }}
}}
"""

    with open(os.path.join(java_dir, "MainActivity.java"), "w") as f:
        f.write(main_activity)

    if app_lock:
        lock_activity = f"""package {package_name};

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import java.util.concurrent.Executor;

public class LockActivity extends AppCompatActivity {{
    @Override
    protected void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);
        Executor executor = ContextCompat.getMainExecutor(this);
        BiometricPrompt prompt = new BiometricPrompt(this, executor, new BiometricPrompt.AuthenticationCallback() {{
            @Override
            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {{
                super.onAuthenticationSucceeded(result);
                startActivity(new Intent(LockActivity.this, MainActivity.class));
                finish();
            }}

            @Override
            public void onAuthenticationError(int errorCode, CharSequence errString) {{
                super.onAuthenticationError(errorCode, errString);
                startActivity(new Intent(LockActivity.this, MainActivity.class));
                finish();
            }}
        }});
        BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
            .setTitle("Разблокировка")
            .setSubtitle("Подтвердите личность")
            .setDeviceCredentialAllowed(true)
            .build();
        try {{
            prompt.authenticate(info);
        }} catch (Exception e) {{
            startActivity(new Intent(LockActivity.this, MainActivity.class));
            finish();
        }}
    }}
}}
"""
        with open(os.path.join(java_dir, "LockActivity.java"), "w") as f:
            f.write(lock_activity)

    if push_enabled and push_provider == "onesignal" and onesignal_app_id:
        app_java = f"""package {package_name};

import android.app.Application;
import com.onesignal.OneSignal;

public class App extends Application {{
    @Override
    public void onCreate() {{
        super.onCreate();
        OneSignal.setLogLevel(OneSignal.LOG_LEVEL.NONE, OneSignal.LOG_LEVEL.NONE);
        OneSignal.initWithContext(this);
        OneSignal.setAppId({java_str(onesignal_app_id)});
    }}
}}
"""
        with open(os.path.join(java_dir, "App.java"), "w") as f:
            f.write(app_java)


def send_callback(callback_url: str, build_id: int, status: str, apk_url: Optional[str] = None, error: Optional[str] = None):
    if not callback_url:
        logger.error(f"[build {build_id}] callback_url не задан, результат '{status}' некуда отправить")
        return
    logger.info(f"[build {build_id}] отправляю callback: status={status}, error={(error or '')[:200]!r}")
    payload = json.dumps({
        "build_id": build_id,
        "status": status,
        "apk_url": apk_url,
        "error": error,
    }).encode()
    for attempt in range(5):
        req = urllib.request.Request(
            callback_url,
            data=payload,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "X-Build-Token": BUILD_TOKEN,
                "User-Agent": "curl/8.5.0",
                "Accept": "*/*",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                logger.info(f"[build {build_id}] callback доставлен, HTTP {resp.status}")
            return
        except Exception as e:
            logger.warning(f"[build {build_id}] попытка {attempt + 1}/5 отправки callback не удалась: {e}")
            if attempt < 4:
                time.sleep(6 * (attempt + 1))
    logger.error(f"[build {build_id}] callback НЕ доставлен после 5 попыток, результат '{status}' потерян")


def run_build(req: BuildRequest, base_url: str):
    work_dir = os.path.join(BUILDS_DIR, str(req.build_id))
    logger.info(f"[build {req.build_id}] старт сборки: app_name={req.app_name!r}, site_url={req.site_url!r}")
    with active_builds_lock:
        active_builds[req.build_id] = {"started_at": time.time(), "stage": "starting"}
    try:
        if os.path.exists(work_dir):
            shutil.rmtree(work_dir)
        os.makedirs(work_dir, exist_ok=True)

        pkg = sanitize_package(req.package_name, req.build_id)
        logger.info(f"[build {req.build_id}] генерирую Android-проект (package={pkg})")
        generate_project(work_dir, pkg, req.app_name, req.site_url, req)
        logger.info(f"[build {req.build_id}] проект сгенерирован, запускаю gradle assembleDebug")

        proc = subprocess.Popen(
            ["gradle", "assembleDebug", "--no-daemon"],
            cwd=work_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            start_new_session=True,
        )

        try:
            stdout, _ = proc.communicate(timeout=900)
            returncode = proc.returncode
            logger.info(f"[build {req.build_id}] gradle завершился с кодом {returncode}")
        except subprocess.TimeoutExpired:
            logger.error(f"[build {req.build_id}] превышено время сборки (15 минут), убиваю процесс gradle")
            _kill_process_group(proc)
            try:
                stdout, _ = proc.communicate(timeout=10)
            except Exception:
                stdout = ""
            logger.error(f"[build {req.build_id}] последние строки лога gradle:\n{(stdout or '')[-1500:]}")
            send_callback(req.callback_url, req.build_id, "failed", error="Превышено время сборки (15 минут)")
            return

        if returncode != 0:
            error_log = (stdout or "")[-1500:]
            logger.error(f"[build {req.build_id}] gradle упал с ошибкой:\n{error_log}")
            send_callback(req.callback_url, req.build_id, "failed", error=error_log)
            return

        built_apk = os.path.join(work_dir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
        if not os.path.exists(built_apk):
            logger.error(f"[build {req.build_id}] gradle вернул код 0, но APK-файл не найден по пути {built_apk}")
            send_callback(req.callback_url, req.build_id, "failed", error=f"APK-файл не найден после сборки: {built_apk}")
            return

        apk_name = f"app_{req.build_id}_{uuid.uuid4().hex[:8]}.apk"
        final_path = os.path.join(APKS_DIR, apk_name)
        shutil.copy(built_apk, final_path)
        logger.info(f"[build {req.build_id}] APK скопирован в {final_path}")

        apk_url = f"{base_url}/download/{apk_name}"
        send_callback(req.callback_url, req.build_id, "ready", apk_url=apk_url)
    except Exception as e:
        logger.exception(f"[build {req.build_id}] необработанная ошибка при сборке: {e}")
        send_callback(req.callback_url, req.build_id, "failed", error=str(e))
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
        with active_builds_lock:
            active_builds.pop(req.build_id, None)


def _kill_process_group(proc: subprocess.Popen):
    '''Убивает весь дочерний процесс Gradle (демоны/воркеры), не только основной pid'''
    try:
        pgid = os.getpgid(proc.pid)
        os.killpg(pgid, signal.SIGTERM)
        time.sleep(3)
        os.killpg(pgid, signal.SIGKILL)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


@app.post("/build")
async def build_app(params: BuildRequest, x_build_token: str = Header(None)):
    if x_build_token != BUILD_TOKEN:
        logger.warning(f"[build {params.build_id}] запрос отклонён: неверный токен")
        raise HTTPException(status_code=401, detail="Invalid token")

    logger.info(f"[build {params.build_id}] заявка принята, callback_url={params.callback_url!r}")
    base_url = "http://188.225.42.134:8000"

    thread = threading.Thread(
        target=run_build,
        args=(params, base_url),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "build_id": params.build_id}


@app.get("/download/{apk_name}")
async def download_apk(apk_name: str):
    apk_path = os.path.join(APKS_DIR, apk_name)
    if not os.path.exists(apk_path):
        raise HTTPException(status_code=404, detail="APK not found")
    return FileResponse(
        apk_path,
        media_type="application/vnd.android.package-archive",
        filename=apk_name,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/status/{build_id}")
async def build_status(build_id: int):
    with active_builds_lock:
        info = active_builds.get(build_id)
    if not info:
        return {"active": False}
    return {
        "active": True,
        "stage": info.get("stage"),
        "elapsed_seconds": round(time.time() - info["started_at"]),
    }


@app.get("/active-builds")
async def list_active_builds(x_build_token: str = Header(None)):
    if x_build_token != BUILD_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    with active_builds_lock:
        return {
            bid: {"stage": info.get("stage"), "elapsed_seconds": round(time.time() - info["started_at"])}
            for bid, info in active_builds.items()
        }