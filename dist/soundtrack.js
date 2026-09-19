const toggle = document.getElementById('soundtrack-toggle');
const music = document.getElementById('background-music');
const label = document.getElementById('music-label');
const status = document.getElementById('music-status');
music.volume = 0.35;
let enabled = false;
let change = 0;

function render() {
  toggle.setAttribute('aria-pressed', String(enabled));
  toggle.setAttribute('aria-label', enabled ? 'Turn background music off' : 'Turn background music on');
  label.textContent = enabled ? 'Music on' : 'Music off';
}

function turnOff() {
  enabled = false;
  change++;
  music.pause();
  toggle.removeAttribute('aria-busy');
  render();
}

function failed() {
  turnOff();
  status.textContent = 'Music could not play. Check your connection, then turn music on to try again.';
  status.hidden = false;
}

toggle.addEventListener('click', async () => {
  if (enabled) {
    turnOff();
    return;
  }
  const current = ++change;
  enabled = true;
  status.hidden = true;
  status.textContent = '';
  render();
  toggle.setAttribute('aria-busy', 'true');
  label.textContent = 'Loading…';
  try {
    if (music.error) music.load();
    await music.play();
    // A slow play request must not overwrite a newer on/off choice.
    if (current === change) {
      toggle.removeAttribute('aria-busy');
      render();
    }
  } catch {
    if (current === change) failed();
  }
});
music.addEventListener('error', failed);
music.addEventListener('pause', () => {
  if (music.paused && enabled) turnOff();
});
window.addEventListener('pagehide', turnOff);
