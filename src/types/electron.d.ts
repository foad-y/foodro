// export {};

// declare global {
//   interface Window {
//     electronAPI?: {
//       /**
//        * Send receipt HTML to the main process for silent printing.
//        * @returns Promise<boolean> - whether the print was successful
//        */
//       printReceipt: (htmlContent: string) => Promise<boolean>;

//       /**
//        * Get list of available printers.
//        * @returns Promise<PrinterInfo[]>
//        */
//       getPrinters: () => Promise<{
//         name: string;
//         displayName: string;
//         status: string;
//         isDefault: boolean;
//       }[]>;

//       getImages: () => Promise<any[]>;

//       /**
//        * Set the selected printer by name.
//        * @param printerName Name of the printer to use
//        * @returns Promise<boolean>
//        */
//       setPrinter: (printerName: string) => Promise<boolean>;

//       /**
//        * Get the currently selected printer name.
//        * @returns Promise<string> - printer name or empty string
//        */
//       getPrinter: () => Promise<string>;
//     };
//   }
// }
export interface UpdateInfo {
  version: string;
  url: string;
  releaseNotes?: string;
  mandatory?: boolean;
}

export interface ElectronAPI {
  printReceipt: (htmlContent: string) => Promise<boolean>;
  getPrinters: () => Promise<{ name: string; displayName: string; status: string; isDefault: boolean }[]>;
  setPrinter: (printerName: string) => Promise<boolean>;
  getPrinter: () => Promise<string>;
  getImages: () => Promise<{ id: string; name: string; img: string }[]>;

  getAppVersion: () => Promise<string>;
  checkUpdate: () => Promise<UpdateInfo | null>;
  downloadUpdate: (updateInfo: UpdateInfo) => Promise<{ success: boolean; zipPath?: string; error?: string }>;
  applyUpdate: (zipPath: string, newVersion: string) => Promise<{ success: boolean; error?: string }>;
  restartApp: () => Promise<void>;
  onUpdateProgress: (callback: (percent: number) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};