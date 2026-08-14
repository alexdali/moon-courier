(() => {
  let storedProvider = 'cloud';
  try {
    storedProvider = localStorage.getItem('moonCourierAiProvider') || 'cloud';
  } catch (_) {
    storedProvider = 'cloud';
  }

  const providerState = { mode: storedProvider };

  const labels = {
    cloud: {
      short: 'Cloud Flash',
      long: 'Cloud Flash · Online',
      icon: 'i-cloud',
      toastTitle: 'Cloud AI enabled',
      toastCopy: 'Tool calling and scenario generation use the online model.',
    },
    local: {
      short: 'Local Qwen 8B',
      long: 'Qwen 8B · Local',
      icon: 'i-cpu',
      toastTitle: 'Local AI enabled',
      toastCopy: 'The interface now uses the local model profile.',
    },
  };

  window.MoonCourier = window.MoonCourier || {};

  function icon(id, className = 'icon icon-sm') {
    return `<svg class="${className}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  }

  function showToast(title, copy, tone = 'cyan') {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconId = tone === 'mint' ? 'i-check' : tone === 'red' ? 'i-alert' : tone === 'violet' ? 'i-sparkles' : 'i-info';
    toast.innerHTML = `
      <div class="toast-icon ${tone === 'mint' ? 'text-mint' : tone === 'red' ? 'text-red' : tone === 'violet' ? 'text-violet' : ''}">${icon(iconId)}</div>
      <div><strong>${title}</strong><span>${copy}</span></div>
    `;
    stack.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      toast.style.transition = '180ms ease';
      window.setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  function applyProvider(mode, announce = false) {
    providerState.mode = mode;
    try {
      localStorage.setItem('moonCourierAiProvider', mode);
    } catch (_) {
      // The prototype still works when storage is unavailable (for example, an opaque file preview).
    }
    const data = labels[mode];

    document.querySelectorAll('[data-provider-label]').forEach((node) => {
      node.textContent = node.dataset.providerLabel === 'long' ? data.long : data.short;
    });

    document.querySelectorAll('[data-provider-use]').forEach((node) => {
      node.setAttribute('href', `#${data.icon}`);
    });

    document.querySelectorAll('[data-provider-status]').forEach((node) => {
      node.textContent = mode === 'cloud' ? 'ONLINE' : 'LOCAL';
    });

    if (announce) showToast(data.toastTitle, data.toastCopy, mode === 'local' ? 'violet' : 'cyan');
  }

  function bindProviderSwitch() {
    document.querySelectorAll('[data-action="toggle-provider"]').forEach((button) => {
      button.addEventListener('click', () => {
        applyProvider(providerState.mode === 'cloud' ? 'local' : 'cloud', true);
      });
    });
    applyProvider(providerState.mode);
  }

  function bindGenericToasts() {
    document.querySelectorAll('[data-toast-title]').forEach((button) => {
      button.addEventListener('click', () => {
        showToast(
          button.dataset.toastTitle || 'Updated',
          button.dataset.toastCopy || 'The prototype state was updated.',
          button.dataset.toastTone || 'cyan',
        );
      });
    });
  }

  function bindModalClose() {
    document.querySelectorAll('[data-modal-close]').forEach((button) => {
      button.addEventListener('click', () => {
        button.closest('.modal-backdrop')?.classList.remove('is-open');
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.remove('is-open');
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.is-open').forEach((modal) => modal.classList.remove('is-open'));
      }
    });
  }

  function startClock() {
    const clock = document.querySelector('[data-sim-clock]');
    if (!clock) return;
    let hour = 14;
    let minute = 32;
    window.setInterval(() => {
      minute += 1;
      if (minute >= 60) {
        minute = 0;
        hour = (hour + 1) % 24;
      }
      clock.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }, 12000);
  }

  window.MoonCourier.icon = icon;
  window.MoonCourier.showToast = showToast;
  window.MoonCourier.applyProvider = applyProvider;
  window.MoonCourier.providerState = providerState;

  document.addEventListener('DOMContentLoaded', () => {
    bindProviderSwitch();
    bindGenericToasts();
    bindModalClose();
    startClock();
  });
})();
