declare global {
  interface ChromeStorageArea {
    get(keys: string[] | string, callback: (items: Record<string, unknown>) => void): void;
    set(items: Record<string, unknown>, callback: () => void): void;
  }

  interface ChromeStorage {
    local: ChromeStorageArea;
  }

  interface ChromeApi {
    storage?: ChromeStorage;
  }

  interface Window {
    chrome?: ChromeApi;
  }
}

export {};
