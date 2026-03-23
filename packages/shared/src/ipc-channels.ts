export const IPC = {
  // AI
  AI_CALL: 'ai:call',
  AI_STREAM: 'ai:stream',
  AI_STREAM_CHUNK: 'ai:stream:chunk',
  AI_STREAM_END: 'ai:stream:end',
  AI_STREAM_ERROR: 'ai:stream:error',
  AI_GET_PROVIDER: 'ai:getProvider',
  AI_GET_MODEL: 'ai:getModel',
  AI_LIST_PROVIDERS: 'ai:listProviders',

  // Keys
  KEYS_SET: 'keys:set',
  KEYS_GET: 'keys:get',
  KEYS_DELETE: 'keys:delete',
  KEYS_LIST: 'keys:list',
  KEYS_HAS: 'keys:has',

  // Storage
  STORAGE_SET: 'storage:set',
  STORAGE_GET: 'storage:get',
  STORAGE_DELETE: 'storage:delete',
  STORAGE_KEYS: 'storage:keys',
  STORAGE_CLEAR: 'storage:clear',

  // Shell
  SHELL_GET_APP_INFO: 'shell:getAppInfo',
  SHELL_GET_VERSION: 'shell:getVersion',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
  SHELL_NOTIFY: 'shell:notify',
  SHELL_SET_TITLE: 'shell:setTitle',
  SHELL_THEME: 'shell:theme',

  // App management (shell renderer <-> main)
  APP_LIST: 'app:list',
  APP_LAUNCH: 'app:launch',
  APP_CLOSE: 'app:close',

  // Store (shell renderer <-> main)
  STORE_FETCH_REGISTRY: 'store:fetchRegistry',
  STORE_INSTALL_APP: 'store:installApp',
  STORE_UNINSTALL_APP: 'store:uninstallApp',

  // Database (SQLite)
  DB_RUN: 'db:run',
  DB_QUERY: 'db:query',
  DB_TRANSACTION: 'db:transaction',

  // Dev warnings (main -> app webContents)
  DEV_WARNING: 'dev:warning',

  // Sideloading
  STORE_SIDELOAD_APP: 'store:sideload-app',
  STORE_UNSIDELOAD_APP: 'store:unsideload-app',
  SHELL_SELECT_FOLDER: 'shell:select-folder',
  SIDELOAD_CHANGED: 'sideload:changed',

  // Publish wizard
  PUBLISH_SELECT_FOLDER: 'publish:select-folder',
  PUBLISH_READ_FOLDER: 'publish:read-folder',
  PUBLISH_VALIDATE: 'publish:validate',
  PUBLISH_CREATE_BUNDLE: 'publish:create-bundle',
  PUBLISH_OPEN_PR: 'publish:open-pr',
} as const;
