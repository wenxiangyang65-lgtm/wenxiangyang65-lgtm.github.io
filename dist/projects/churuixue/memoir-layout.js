'use strict';
document.querySelectorAll('.chapter-extra').forEach(details => {
  const summary = details.querySelector('summary');
  function syncChapterLabel() {
    const firstText = [...summary.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (firstText) firstText.textContent = details.open ? '收起本章镜头 ' : '展开本章镜头 ';
  }
  details.addEventListener('toggle', syncChapterLabel);
  syncChapterLabel();
});
