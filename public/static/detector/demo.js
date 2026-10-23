const offlineMessage = 'Sorry — there’s no server connected right now, so the scan is taking a nap and won’t work for now. 😅';

function keepPreviewOffline(form, errorSelector) {
  if (!form) return;
  form.addEventListener('submit', (event) => {
    if (form.id === 'batch-form') {
      const hasFiles = ['#folder-input', '#batch-input'].some((selector) => {
        const input = document.querySelector(selector);
        return input && input.files && input.files.length > 0;
      });

      // Let the regular form validation explain that files must be selected.
      if (!hasFiles) return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    const error = document.querySelector(errorSelector);
    if (!error) return;
    error.textContent = offlineMessage;
    error.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, { capture: true });
}

keepPreviewOffline(document.querySelector('#upload-form'), '#upload-error');
keepPreviewOffline(document.querySelector('#batch-form'), '#batch-validation');
