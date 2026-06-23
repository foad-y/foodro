const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const axios = require('axios');
const AdmZip = require('adm-zip');
const log = require('electron-log'); // اضافه شدن لاگر برای ثبت خطاها در فایل

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

let mainWindow = null;
let selectedPrinterName = '';

// ─────────────────────────────────────────────────────────────────────────────
// مدیریت نسخه لوکال (version.json در userData)
// ─────────────────────────────────────────────────────────────────────────────
function getVersionFilePath() {
  return path.join(app.getPath('userData'), 'version.json');
}

function getLocalVersion() {
  try {
    const filePath = getVersionFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (data?.version) return data.version;
    }
  } catch (err) {
    log.warn('[VERSION] read failed:', err.message);
  }
  const initial = app.getVersion();
  setLocalVersion(initial);
  return initial;
}

function setLocalVersion(version) {
  try {
    const filePath = getVersionFilePath();
    fs.writeFileSync(filePath, JSON.stringify({ version, updatedAt: Date.now() }, null, 2));
  } catch (err) {
    log.error('[VERSION] write failed:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// مسیر پوشه dist (واقعی، قابل نوشتن — چه dev چه packaged)
// ─────────────────────────────────────────────────────────────────────────────
function getDistFolder() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'dist');
  }
  return path.join(__dirname, '../dist');
}

function getIconPath() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'logo', 'burger.png');
  }
  return path.join(__dirname, '../public/img/burger.png');
}

function registerAppProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    try {
      let url = request.url.replace('app://', '');
      url = decodeURIComponent(url);
      url = url.replace(/^\.\//, '');
      url = url.replace(/^\/+/, '');
      url = url.split('?')[0];
      url = url.split('#')[0];

      // خواندن مستقیم تمام فایل‌ها (شامل img) از پوشه dist
      const filePath = path.join(getDistFolder(), url);

      callback({ path: filePath });
    } catch (err) {
      log.error('[PROTOCOL] error serving file:', err);
      callback({ error: -2 });
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const useDevServer =
    !app.isPackaged &&
    process.argv.includes('--dev') &&
    process.env.NODE_ENV === 'development';

  if (useDevServer) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL('app://./index.html');
  }

  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    log.error(`[LOAD FAIL] code=${code} url=${url} desc=${desc}`);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log.error('[RENDERER CRASHED]', details);
  });

  mainWindow.webContents.on('did-start-navigation', (_event, url) => {
    log.info('[NAVIGATION]', url);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto Updater (dist replacement)
// ─────────────────────────────────────────────────────────────────────────────
// const UPDATE_CHECK_URL = 'http://192.168.43.9:3030/api/app-update/check';
const UPDATE_CHECK_URL = 'https://kaliznd.blhgroups.ir/api/app-update/check';
const updateTmpDir = () => path.join(app.getPath('userData'), 'update-tmp');

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

ipcMain.handle('get-app-version', () => getLocalVersion());

ipcMain.handle('check-update', async () => {
  const currentVersion = getLocalVersion();
  log.info('[UPDATER] check-update called, currentVersion =', currentVersion);
  try {
    const res = await axios.get(UPDATE_CHECK_URL, {
      params: { currentVersion },
      timeout: 8000,
    });
    const info = res.data;
    log.info('[UPDATER] server response:', info);
    if (info?.version && compareVersions(info.version, currentVersion) > 0) {
      log.info('[UPDATER] update available:', info.version);
      return info;
    }
    log.info('[UPDATER] no update needed');
    return null;
  } catch (err) {
    log.error('[UPDATER] check-update FAILED:', err.message);
    return null;
  }
});

ipcMain.handle('download-update', async (event, updateInfo) => {
  log.info('[UPDATER] download-update called with:', updateInfo);
  const tmpDir = updateTmpDir();
  await fsExtra.ensureDir(tmpDir);
  const zipPath = path.join(tmpDir, 'dist.zip');
  log.info('[UPDATER] zipPath =', zipPath);

  try {
    log.info('[UPDATER] starting axios.get for download...');
    const response = await axios.get(updateInfo.url, {
      responseType: 'stream',
      timeout: 30000, // اضافه‌کردن تایم‌اوت منطقی
    });
    log.info('[UPDATER] response received, status:', response.status, 'content-length:', response.headers['content-length']);

    const total = parseInt(response.headers['content-length'] || '0', 10);
    let downloaded = 0;

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(zipPath);
      
      response.data.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total) {
          const percent = Math.round((downloaded / total) * 100);
          if (!event.sender.isDestroyed()) {
            event.sender.send('update-progress', percent);
          }
        }
      });
      
      response.data.on('error', (err) => {
        log.error('[UPDATER] response stream error:', err.message);
        writer.close();
        reject(err);
      });
      
      response.data.pipe(writer);
      
      // 🔴 تغییر مهم اینجاست
      writer.on('finish', () => {
        log.info('[UPDATER] stream finished writing, closing file descriptor...');
        // فایل را به صورت دستی و کامل می‌بندیم تا قفل ویندوز آزاد شود
        writer.close((err) => {
          if (err) {
            log.error('[UPDATER] failed to close file:', err);
            return reject(err);
          }
          log.info('[UPDATER] file completely closed, total bytes:', downloaded);
          resolve();
        });
      });
      
      writer.on('error', (err) => {
        log.error('[UPDATER] writer error:', err.message);
        writer.close();
        reject(err);
      });
    });

    log.info('[UPDATER] download-update SUCCESS, returning zipPath');
    return { success: true, zipPath };
  } catch (err) {
    log.error('[UPDATER] download-update FAILED:', err.message);
    await fsExtra.remove(zipPath).catch(() => {});
    return { success: false, error: err.message };
  }
});

ipcMain.handle('apply-update', async (_event, zipPath, newVersion) => {
  log.info('[UPDATER] apply-update called, zipPath =', zipPath, 'newVersion =', newVersion);
  const tmpDir = updateTmpDir();
  const extractDir = path.join(tmpDir, 'extracted');
  const distDir = getDistFolder();

  log.info('[UPDATER] distDir =', distDir);
  log.info('[UPDATER] extractDir =', extractDir);

  try {
    log.info('[UPDATER] step 1: removing old extractDir if exists...');
    await fsExtra.remove(extractDir);
    log.info('[UPDATER] step 2: ensuring extractDir...');
    await fsExtra.ensureDir(extractDir);
    
    // تأخیر کوتاه برای اطمینان از آزاد شدن فایل توسط آنتی‌ویروس
    log.info('[UPDATER] step 2.5: waiting 1s for file lock release...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    log.info('[UPDATER] step 3: extracting zip using adm-zip...');
    
    // استفاده از adm-zip برای اکسترکت بی‌دردسر روی ویندوز
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true); // true یعنی فایل‌های موجود رو overwrite کنه
    
    log.info('[UPDATER] step 3 DONE: zip extracted');

    log.info('[UPDATER] step 4: checking index.html exists...');
    let sourceDir = extractDir;
    let hasIndex = await fsExtra.pathExists(path.join(sourceDir, 'index.html'));
    
    // بررسی اینکه آیا فایل‌ها داخل پوشه dist اکسترکت شدن یا نه
    if (!hasIndex) {
      const nestedDist = path.join(extractDir, 'dist');
      if (await fsExtra.pathExists(path.join(nestedDist, 'index.html'))) {
        log.info('[UPDATER] found nested dist folder, adjusting source path...');
        sourceDir = nestedDist;
        hasIndex = true;
      }
    }

    log.info('[UPDATER] hasIndex =', hasIndex);
    if (!hasIndex) {
      throw new Error('فایل دانلود‌شده معتبر نیست (فایل index.html یافت نشد)');
    }

    log.info('[UPDATER] step 5: OVERWRITING distDir with extracted files...');
    await fsExtra.copy(sourceDir, distDir, { overwrite: true });
    log.info('[UPDATER] step 5 DONE');

    log.info('[UPDATER] step 6: cleanup...');
    await fsExtra.remove(extractDir).catch(() => {});
    await fsExtra.remove(zipPath).catch(() => {});
    log.info('[UPDATER] step 6 DONE');

    if (newVersion) {
      setLocalVersion(newVersion);
      log.info('[UPDATER] local version set to', newVersion);
    }

    log.info('[UPDATER] apply-update SUCCESS ✅');
    return { success: true };
  } catch (err) {
    log.error('[UPDATER] apply-update FAILED ❌:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restart-app', () => {
  app.relaunch();
  app.exit(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// IPC Handlers (printer/images)
// ─────────────────────────────────────────────────────────────────────────────
ipcMain.handle('get-printers', async () => {
  try {
    if (!mainWindow) return [];
    const list = await mainWindow.webContents.getPrintersAsync();
    return list.map((p) => ({
      name: p.name,
      displayName: p.displayName || p.name,
      status: p.status || 'unknown',
      isDefault: p.isDefault || false,
    }));
  } catch (err) {
    log.error('[PRINTER] Error:', err);
    return [];
  }
});

ipcMain.handle('set-printer', async (_event, printerName) => {
  selectedPrinterName = printerName;
  return true;
});

ipcMain.handle('get-printer', async () => {
  return selectedPrinterName;
});

ipcMain.handle('print-receipt', async (_event, htmlContent) => {
  const printerName = selectedPrinterName;
  try {
    const printWindow = new BrowserWindow({
      width: 400,
      height: 600,
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );
    await new Promise((r) => setTimeout(r, 2000));

    const result = await new Promise((resolve) => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName,
          margins: { marginType: 'none' },
          pageSize: { width: 80000, height: 200000 },
        },
        (success) => resolve(success)
      );
    });

    printWindow.close();
    if (result) return true;
  } catch (err) {
    log.error('[PRINT] Electron error:', err.message);
  }

  try {
    const { execSync } = require('child_process');
    const os = require('os');
    const tmp = path.join(os.tmpdir(), `receipt-${Date.now()}.html`);
    fs.writeFileSync(tmp, htmlContent, 'utf-8');
    const arg = printerName ? `-Name '${printerName}'` : '';
    execSync(
      `powershell -Command "$c = Get-Content '${tmp}' -Raw; $c | Out-Printer ${arg}"`,
      { timeout: 30000, shell: true }
    );
    setTimeout(() => { try { fs.unlinkSync(tmp); } catch {} }, 10000);
    return true;
  } catch (err) {
    log.error('[PRINT] Fallback error:', err.message);
    return false;
  }
});

ipcMain.handle('get-images', async () => {
  try {
    // در حالت پکیج شده از داخل پوشه dist/img می‌خوانیم
    // در حالت dev (چون هنوز بیلدی وجود ندارد) از public/img می‌خوانیم
    const imgDir = app.isPackaged
      ? path.join(getDistFolder(), 'img')
      : path.join(__dirname, '../public/img');

    const files = fs.readdirSync(imgDir);
    return files.map((file, index) => ({
      id: String(index + 1),
      name: path.parse(file).name,
      img: `/img/${encodeURIComponent(file)}`,
    }));
  } catch (err) {
    log.error('[IMAGES] Error reading images:', err.message);
    return [];
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});