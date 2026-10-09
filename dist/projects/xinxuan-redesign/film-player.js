(() => {
  const trigger = document.querySelector('#film-play');
  const dialog = document.querySelector('#film-viewer');
  const player = document.querySelector('#campaign-film');
  const message = document.querySelector('#film-message');
  trigger.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('film-open');
    message.hidden = true;
    if (!player.getAttribute('src')) {
      player.src = player.dataset.src;
      player.load();
    }
    player.play().catch(() => {
      if (dialog.open) message.hidden = false;
    });
  });
  document.querySelector('#film-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.pause();
    document.body.classList.remove('film-open');
    trigger.focus({preventScroll:true});
  });
  player.addEventListener('play', () => {
    if (!dialog.open) player.pause();
    else message.hidden = true;
  });
  player.addEventListener('error', () => {
    message.textContent = '视频暂时无法加载，请关闭后重新打开。';
    message.hidden = false;
    player.removeAttribute('src');
  });
})();
