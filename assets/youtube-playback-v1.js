(function () {
  'use strict';

  function loadAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (window.__invitationYouTubeAPI) return window.__invitationYouTubeAPI;
    window.__invitationYouTubeAPI = new Promise(function (resolve, reject) {
      const previous = window.onYouTubeIframeAPIReady;
      const timeout = setTimeout(function () {
        window.__invitationYouTubeAPI = null;
        reject(new Error('YouTube took too long to load'));
      }, 12000);
      window.onYouTubeIframeAPIReady = function () {
        clearTimeout(timeout);
        if (typeof previous === 'function') previous();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = function () {
        clearTimeout(timeout);
        window.__invitationYouTubeAPI = null;
        reject(new Error('YouTube is unavailable'));
      };
      document.head.appendChild(script);
    });
    return window.__invitationYouTubeAPI;
  }

  window.InvitationYouTubePlayer = class {
    constructor(id, onChange) {
      this.id = id;
      this.onChange = onChange;
      this.ready = false;
      this.requested = false;
      this.destroyed = false;
      this.player = null;
      this.timer = null;
    }

    notify(needsTap, muted, error) {
      if (!this.destroyed) this.onChange({needsTap: !!needsTap, muted: !!muted, error: !!error});
    }

    init() {
      if (this.player || this.destroyed) return Promise.resolve();
      if (this.initializing) return this.initializing;
      this.initializing = loadAPI().then(YT => {
        if (this.destroyed) return;
        this.player = new YT.Player(this.id, {events: {
          onReady: () => {
            if (this.destroyed) return;
            this.ready = true;
            // Readiness is asynchronous: never unmute outside a real tap.
            if (this.requested) this.play(false);
          },
          onStateChange: event => {
            if (this.destroyed) return;
            if (event.data === 1) {
              clearTimeout(this.timer);
              this.timer = null;
              const muted = this.player.isMuted();
              this.notify(muted, muted, false);
            }
          },
          onAutoplayBlocked: () => {
            if (!this.requested || this.destroyed) return;
            this.notify(true, true, false);
            if (!this.mutedAttempt) this.play(false);
          },
          onError: () => {
            clearTimeout(this.timer);
            this.timer = null;
            this.notify(true, false, true);
          }
        }});
      }).catch(() => {
        this.initializing = null;
        if (this.requested) this.notify(true, false, true);
      });
      return this.initializing;
    }

    watch() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.requested) this.notify(true, false, false);
      }, 5000);
    }

    play(userGesture) {
      if (!this.ready || !this.requested || this.destroyed) return;
      this.mutedAttempt = !userGesture;
      this.watch();
      try {
        if (userGesture) this.player.unMute();
        else this.player.mute();
        this.player.playVideo();
      } catch (_) {
        this.notify(true, false, true);
      }
    }

    start(userGesture) {
      if (this.destroyed) return;
      this.requested = true;
      this.notify(false, false, false);
      if (this.ready) this.play(!!userGesture);
      else {
        this.watch();
        this.init();
      }
    }

    pause() {
      this.requested = false;
      clearTimeout(this.timer);
      this.timer = null;
      if (this.ready) this.player.pauseVideo();
      this.notify(false, false, false);
    }

    destroy() {
      this.destroyed = true;
      this.requested = false;
      clearTimeout(this.timer);
      this.timer = null;
      if (this.player && this.player.destroy) this.player.destroy();
    }
  };
})();
