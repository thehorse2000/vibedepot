import type { IpcRenderer } from 'electron';

interface DevWarning {
  type: string;
  permission: string;
  message: string;
}

/**
 * Sets up dev warning banner injection for sideloaded apps.
 * When the main process detects an undeclared permission call,
 * it sends a dev:warning event which this module renders as
 * a dismissible amber banner at the top of the page.
 */
export function setupDevWarnings(ipcRenderer: IpcRenderer): void {
  ipcRenderer.on('dev:warning', (_event: unknown, warning: DevWarning) => {
    injectBanner(warning.message);
  });
}

function injectBanner(message: string): void {
  const inject = (): void => {
    const banner = document.createElement('div');
    banner.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'right: 0',
      'z-index: 99999',
      'background: #fef3c7',
      'border-bottom: 2px solid #f59e0b',
      'color: #92400e',
      'padding: 8px 16px',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'font-size: 13px',
      'font-weight: 500',
      'cursor: pointer',
      'display: flex',
      'align-items: center',
      'gap: 8px',
      'animation: vd-slide-down 0.2s ease-out',
    ].join(';');

    banner.innerHTML = `<span style="font-size:16px">&#9888;</span><span>${escapeHtml(message)}</span><span style="margin-left:auto;opacity:0.6;font-size:11px">click to dismiss</span>`;

    banner.addEventListener('click', () => {
      banner.style.animation = 'vd-slide-up 0.15s ease-in forwards';
      setTimeout(() => banner.remove(), 150);
    });

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.style.animation = 'vd-slide-up 0.15s ease-in forwards';
        setTimeout(() => banner.remove(), 150);
      }
    }, 8000);

    // Inject animation keyframes if not already present
    if (!document.getElementById('vd-dev-warning-styles')) {
      const style = document.createElement('style');
      style.id = 'vd-dev-warning-styles';
      style.textContent = `
        @keyframes vd-slide-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes vd-slide-up { from { transform: translateY(0); } to { transform: translateY(-100%); } }
      `;
      document.head.appendChild(style);
    }

    document.body.prepend(banner);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
