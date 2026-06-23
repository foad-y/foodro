import { contextBridge, ipcRenderer } from 'electron';

export interface PrinterInfo {
  name: string;
  displayName: string;
  status: string;
  isDefault: boolean;
}

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Send receipt HTML to the main process for silent printing.
   * @returns Promise<boolean> - whether the print was successful
   */
  printReceipt: (htmlContent: string): Promise<boolean> => {
    return ipcRenderer.invoke('print-receipt', htmlContent);
  },

  /**
   * Get list of available printers.
   * @returns Promise<PrinterInfo[]> - list of printers
   */
  getPrinters: (): Promise<PrinterInfo[]> => {
    return ipcRenderer.invoke('get-printers');
  },

  /**
   * Set the selected printer by name.
   * @param printerName Name of the printer to use
   * @returns Promise<boolean>
   */
  setPrinter: (printerName: string): Promise<boolean> => {
    return ipcRenderer.invoke('set-printer', printerName);
  },

  /**
   * Get the currently selected printer name.
   * @returns Promise<string> - printer name or empty string
   */
  getPrinter: (): Promise<string> => {
    return ipcRenderer.invoke('get-printer');
  },
});
