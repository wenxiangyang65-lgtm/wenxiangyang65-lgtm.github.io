/* Reserve space for artwork while the image loads. The page uses the device viewport. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img[data-preview-aspect]').forEach(image => {
    if (getComputedStyle(image).aspectRatio === 'auto') {
      image.style.aspectRatio = `auto ${image.dataset.previewAspect}`;
    }
  });
}, {once: true});
