const toggle = document.getElementById('soundtrack-toggle');
const panel = document.getElementById('soundtrack-panel');
const player = document.getElementById('soundtrack-player');
const stop = document.getElementById('soundtrack-stop');

function setSoundtrackOpen(open) {
  if (open) {
    const frame = document.createElement('iframe');
    frame.src = 'https://open.spotify.com/embed/album/3B61kSKTxlY36cYgzvf3cP?theme=0';
    frame.title = 'Interstellar soundtrack by Hans Zimmer — Spotify player';
    frame.width = '100%';
    frame.height = '152';
    frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    player.replaceChildren(frame);
  } else {
    // Unload the player so closing it also stops its audio.
    player.replaceChildren();
  }
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close player and stop music' : 'Open soundtrack player');
  (open ? stop : toggle).focus();
}

toggle.addEventListener('click', () => setSoundtrackOpen(panel.hidden));
stop.addEventListener('click', () => setSoundtrackOpen(false));
panel.addEventListener('keydown', event => {
  if (event.key === 'Escape') setSoundtrackOpen(false);
});
