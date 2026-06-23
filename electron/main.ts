import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built directory structure
//
// ├─┬─ electron
// │ ├── main.js
// │ └── preload.js
// ├─┬─ dist
// │ └── index.html
// └── package.json

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let mainWindow: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// ── Selected printer name (set from renderer) ──────────────────────
let selectedPrinterName = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/img/burger.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false, // Show when ready to prevent visual flash
  });

  // Prevent white screen flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open DevTools in development mode for debugging
  if (VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  }

  // Log page load errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(process.env.DIST!, 'index.html'));
  }
}

// ── IPC: Get available printers list ──────────────────────────────────
ipcMain.handle('get-printers', async () => {
  try {
    console.log('🖨️ [PRINTER] Fetching printer list...');
    if (!mainWindow) {
      console.warn('⚠️ [PRINTER] Main window not available');
      return [];
    }
    const printerList = await mainWindow.webContents.getPrintersAsync();
    console.log(`🖨️ [PRINTER] Found ${printerList.length} printer(s):`);
    printerList.forEach((p: any) => {
      console.log(`   - "${p.name}" (status: ${p.status || 'unknown'}, default: ${p.isDefault || false})`);
    });
    return printerList.map((p: any) => ({
      name: p.name,
      displayName: p.displayName || p.name,
      status: p.status || 'unknown',
      isDefault: p.isDefault || false,
    }));
  } catch (error) {
    console.error('❌ [PRINTER] Error fetching printers:', error);
    return [];
  }
});

// ── IPC: Set selected printer name ──────────────────────────────────
ipcMain.handle('set-printer', async (_event, printerName: string) => {
  console.log(`🖨️ [PRINTER] Setting printer to: "${printerName}"`);
  selectedPrinterName = printerName;
  return true;
});

// ── IPC: Get selected printer name ──────────────────────────────────
ipcMain.handle('get-printer', async () => {
  return selectedPrinterName;
});

// ── IPC: Silent Print (send directly to printer) ──────────────────────────
ipcMain.handle('print-receipt', async (_event, htmlContent: string) => {
  console.log('📄 [PRINT] Starting print job...');
  console.log(`🖨️ [PRINT] Target printer: "${selectedPrinterName || '(default)'}"`);
  
  try {
    const display = screen.getPrimaryDisplay();
    const printWindow = new BrowserWindow({
      width: Math.round(80 * 3.78), // ~80mm in pixels
      height: Math.round(display.workAreaSize.height / 3),
      show: false, // hidden window for printing
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    console.log('🖨️  [PRINT] Loading content into print window...');
    
    // Load HTML
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Wait for rendering + fonts
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log('🖨️  [PRINT] Sending to printer...');

    // Create promise to handle print callback
    const printResult = await new Promise<boolean>((resolve) => {
      printWindow.webContents.print(
        {
          silent: true, // No print dialog – direct to selected printer
          printBackground: true,
          deviceName: selectedPrinterName, // Use selected printer!
          margins: { marginType: 'none' },
          pageSize: { width: 80000, height: 200000 }, // 80mm wide x auto height (in microns)
          // pageSize: { width: 80_000, height: 300_000 }, // 80mm wide x auto height (in microns)
          dpi: {
            horizontal: 203,
            vertical: 203,
          },
        },
        (success: boolean, failureReason: string) => {
          if (success) {
            console.log('✅ [PRINT] Print job completed successfully!');
          } else {
            console.error('❌ [PRINT] Print failed:', failureReason);
          }
          resolve(success);
        }
      );
    });

    printWindow.close();
    return printResult;
    
  } catch (error) {
    console.error('❌ [PRINT] Error during print operation:', error);
    return false;
  }
});

// ── App lifecycle ─────────────────────────────────────────────────────────
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);