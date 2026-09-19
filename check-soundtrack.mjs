import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const element = () => ({
  hidden: true, attributes: {}, listeners: {}, textContent: '',
  addEventListener(name, fn) { this.listeners[name] = fn; },
  setAttribute(name, value) { this.attributes[name] = value; },
  removeAttribute(name) { delete this.attributes[name]; },
});
const elements = Object.fromEntries(['soundtrack-toggle', 'background-music', 'music-label', 'music-status'].map(id => [id, element()]));
const toggle = elements['soundtrack-toggle'];
const music = elements['background-music'];
const label = elements['music-label'];
const status = elements['music-status'];
const lifecycle = element();
const pending = [];
let plays = 0, loads = 0;
music.paused = true;
music.play = () => { plays++; music.paused = false; return new Promise((resolve, reject) => pending.push({ resolve, reject })); };
music.pause = () => { music.paused = true; music.listeners.pause?.(); };
music.load = () => { loads++; music.error = null; };
runInNewContext(readFileSync(new URL('./dist/soundtrack.js', import.meta.url), 'utf8'), {
  document: { getElementById: id => elements[id] }, window: lifecycle,
});
const html = readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8');
const audioTag = html.match(/<audio\b[^>]*id="background-music"[^>]*>/)?.[0];
assert.ok(audioTag);
assert.match(audioTag, /preload="none"/);
assert.match(audioTag, /\bloop\b/);
assert.doesNotMatch(audioTag, /\bautoplay\b/);
assert.match(html, /id="soundtrack-toggle"[^>]*aria-pressed="false"/);
assert.equal(plays, 0, 'Never starts automatically');
assert.equal(music.volume, .35);

let click = toggle.listeners.click();
assert.equal(toggle.attributes['aria-busy'], 'true');
pending.shift().resolve(); await click;
assert.equal(label.textContent, 'Music on');
assert.equal(toggle.attributes['aria-pressed'], 'true');
music.currentTime = 42;
await toggle.listeners.click();
assert.equal(music.paused, true);
assert.equal(label.textContent, 'Music off');
click = toggle.listeners.click(); pending.shift().resolve(); await click;
assert.equal(music.currentTime, 42, 'Resumes without resetting position');
music.pause();
assert.equal(toggle.attributes['aria-pressed'], 'false', 'Reflects an external pause');

click = toggle.listeners.click(); pending.shift().reject(new Error('Blocked')); await click;
assert.equal(music.paused, true);
assert.equal(status.hidden, false);
assert.match(status.textContent, /could not play/);
click = toggle.listeners.click(); pending.shift().resolve(); await click;
assert.equal(status.hidden, true);
music.error = new Error('Network failure'); music.listeners.error();
assert.equal(toggle.attributes['aria-pressed'], 'false');
click = toggle.listeners.click(); pending.shift().resolve(); await click;
assert.equal(loads, 1, 'A failed resource is reloaded on retry');
await toggle.listeners.click();

const older = toggle.listeners.click(); const oldPlay = pending.shift();
await toggle.listeners.click();
const newer = toggle.listeners.click(); const newPlay = pending.shift();
oldPlay.reject(new Error('Interrupted')); await older;
assert.equal(status.hidden, true, 'Stale failure cannot cancel a newer request');
newPlay.resolve(); await newer;
assert.equal(label.textContent, 'Music on');
await toggle.listeners.click();
click = toggle.listeners.click(); const slowPlay = pending.shift();
await toggle.listeners.click(); slowPlay.resolve(); await click;
assert.equal(toggle.attributes['aria-pressed'], 'false', 'Slow success cannot undo off');
assert.equal(music.paused, true);
click = toggle.listeners.click(); pending.shift().resolve(); await click;
lifecycle.listeners.pagehide();
assert.equal(music.paused, true);
assert.equal(label.textContent, 'Music off');
assert.equal(toggle.attributes['aria-busy'], undefined);
const mp3 = readFileSync(new URL('./dist/assets/space-galaxy-universe.mp3', import.meta.url));
assert.ok(mp3.length > 1e6 && mp3[0] === 0xff && (mp3[1] & 0xe0) === 0xe0, 'Bundled MP3 has an MPEG frame header');
console.log('Passed: music default-off, on/off/resume, errors/retry, rapid toggles, page exit, and bundled audio.');
