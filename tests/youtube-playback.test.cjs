const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
  const states = [], commands = [], timers = new Map();
  let player, nextTimer = 0;
  const window = { YT: { Player: class {
    constructor(_id, options) { this.events = options.events; this.muted = true; player = this; }
    mute() { this.muted = true; commands.push('mute'); }
    unMute() { this.muted = false; commands.push('unMute'); }
    isMuted() { return this.muted; }
    playVideo() { commands.push('play'); }
    pauseVideo() { commands.push('pause'); }
    destroy() { commands.push('destroy'); }
  } } };
  const context = vm.createContext({window, document: {}, Promise,
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: id => timers.delete(id)});
  vm.runInContext(fs.readFileSync('assets/youtube-playback-v1.js', 'utf8'), context);
  const controller = new window.InvitationYouTubePlayer('yt-player', state => states.push(state));
  return { controller, states, commands, timers, get player() { return player; } };
}

test('ready player starts with sound directly inside the user gesture', async () => {
  const s = setup(); await s.controller.init(); s.player.events.onReady();
  assert.deepEqual(s.commands, []);
  s.controller.start(true);
  assert.deepEqual(s.commands, ['unMute', 'play']);
  s.player.events.onStateChange({data: 1});
  assert.equal(s.states.at(-1).needsTap, false);
  assert.equal(s.timers.size, 0);
});

test('slow loading starts muted instead of trying delayed unmuted playback', async () => {
  const s = setup(); s.controller.start(true); await s.controller.init();
  s.player.events.onReady();
  assert.deepEqual(s.commands, ['mute', 'play']);
  s.player.events.onStateChange({data: 1});
  assert.equal(s.states.at(-1).needsTap, true);
  assert.equal(s.states.at(-1).muted, true);
  s.controller.start(true);
  assert.deepEqual(s.commands.slice(-2), ['unMute', 'play']);
});

test('blocked sound falls back to muted playback once, with a visible action', async () => {
  const s = setup(); await s.controller.init(); s.player.events.onReady();
  s.controller.start(true); s.player.events.onAutoplayBlocked();
  assert.deepEqual(s.commands, ['unMute', 'play', 'mute', 'play']);
  s.player.events.onAutoplayBlocked();
  assert.equal(s.commands.length, 4);
  assert.equal(s.states.at(-1).needsTap, true);
});

test('pause before readiness prevents late playback and destroy clears timers', async () => {
  const s = setup(); s.controller.start(true); await s.controller.init();
  s.controller.pause(); s.player.events.onReady();
  assert(!s.commands.includes('play'));
  s.controller.start(true); assert(s.timers.size > 0);
  s.controller.destroy(); assert.equal(s.timers.size, 0);
  assert.equal(s.commands.at(-1), 'destroy');
});

test('timeout and player error expose a manual action without retry loops', async () => {
  const s = setup(); await s.controller.init(); s.player.events.onReady();
  s.controller.start(true);
  [...s.timers.values()].forEach(fn => fn());
  assert.equal(s.states.at(-1).needsTap, true);
  s.player.events.onError({data: 150});
  assert.equal(s.states.at(-1).error, true);
  assert.equal(s.commands.filter(c => c === 'play').length, 1);
});

for (const file of ['index.html', 'Undangan-Shofa-Ari.html']) {
  test(file + ': opening starts media before fullscreen or animation timers, without changing iframe src', () => {
    const html = fs.readFileSync(file, 'utf8');
    const code = html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
    const calls = [], timers = [];
    const overlay = {style: {}, classList: {add() {}, remove() {}}, offsetWidth: 1};
    const content = {style: {display: 'none'}};
    const context = vm.createContext({
      DCLogic: class { setState(patch) { Object.assign(this.state, patch); } },
      window: {location: {search: '', origin: 'https://invitation.example'}, scrollTo() {}},
      document: {getElementById: id => id === 'envelope-overlay' ? overlay : content},
      URLSearchParams, localStorage: {getItem: () => null},
      setTimeout: fn => {timers.push(fn); return timers.length;}, clearTimeout() {}
    });
    vm.runInContext(code + '\nwindow.TestComponent = Component;', context);
    const component = new context.window.TestComponent({});
    component.playYouTube = gesture => calls.push(['youtube', gesture]);
    component.playAudio = () => calls.push(['audio']);
    component.requestFullscreen = () => calls.push(['fullscreen']);
    const before = component.renderVals();
    before.openInvite();
    assert.deepEqual(calls, [['youtube', true], ['audio'], ['fullscreen']]);
    assert.equal(component.state.opened, true);
    assert.equal(content.style.display, 'block');
    assert.equal(component.renderVals().ytSrc, before.ytSrc);
    timers.forEach(fn => fn());
    assert.equal(calls.filter(c => c[0] === 'youtube').length, 1, 'Timers must not replay or unmute media');
    assert(html.includes('id="invitation-content" style="{{invitationStyle}}"'));
    assert(html.includes('onClick="{{activateYouTube}}"'));
  });
}
