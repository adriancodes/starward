import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the actual player lifecycle without contacting Spotify.
let focused;
const element = () => ({
  hidden: true, children: [], attributes: {}, listeners: {},
  addEventListener(name, fn) { this.listeners[name] = fn; },
  replaceChildren(...children) { this.children = children; },
  setAttribute(name, value) { this.attributes[name] = value; },
  focus() { focused = this; },
});
const elements = Object.fromEntries(['soundtrack-toggle', 'soundtrack-panel', 'soundtrack-player', 'soundtrack-stop'].map(id => [id, element()]));
runInNewContext(readFileSync(new URL('./dist/soundtrack.js', import.meta.url), 'utf8'), {
  document: { getElementById: id => elements[id], createElement: element },
});
const toggle = elements['soundtrack-toggle'];
const panel = elements['soundtrack-panel'];
const player = elements['soundtrack-player'];
const stop = elements['soundtrack-stop'];
assert.equal(player.children.length, 0, 'No third-party player before user interaction');
toggle.listeners.click();
assert.equal(panel.hidden, false);
assert.equal(toggle.attributes['aria-expanded'], 'true');
assert.equal(focused, stop);
assert.match(player.children[0].src, /^https:\/\/open\.spotify\.com\/embed\/album\/3B61kSKTxlY36cYgzvf3cP\?theme=0$/);
assert.match(player.children[0].allow, /encrypted-media/);
assert.ok(player.children[0].title);
stop.listeners.click();
assert.equal(player.children.length, 0, 'Closing unloads audio');
assert.equal(panel.hidden, true);
assert.equal(toggle.attributes['aria-expanded'], 'false');
assert.equal(focused, toggle);
toggle.listeners.click();
assert.equal(player.children.length, 1, 'Reopening creates exactly one player');
toggle.listeners.click();
assert.equal(player.children.length, 0, 'Toggle also stops audio');
toggle.listeners.click();
panel.listeners.keydown({ key: 'Escape' });
assert.equal(panel.hidden, true);
assert.equal(player.children.length, 0);
console.log('Soundtrack checks passed: opt-in loading, accessible state, stop, reopen, Escape.');
