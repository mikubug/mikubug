/* ============================================================
   player.js — 背景音乐播放器(全局单例)
   状态用 reactive 暴露给 MusicPlayer.vue,音频实例留在模块内。
   ============================================================ */

import { reactive } from 'vue';

export const MUSIC_TITLE = '梅花开时';
export const MUSIC_SRC = import.meta.env.BASE_URL + 'assets/music.ogg';

export const player = reactive({
  visible: false,      // 右上角播放器是否显示
  playing: false,      // 是否正在播放
  status: 'NOW PLAYING',
  volume: 60,          // 0–100
});

let audio = null;

/** 惰性创建音频元素:只在真正需要播放时才加载,不拖慢首屏 */
function ensure() {
  if (audio) return audio;

  audio = new Audio(MUSIC_SRC);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = player.volume / 100;

  audio.addEventListener('play', () => {
    player.playing = true;
    player.status = 'NOW PLAYING';
  });
  audio.addEventListener('pause', () => {
    player.playing = false;
    player.status = 'PAUSED';
  });
  audio.addEventListener('waiting', () => {
    player.status = 'LOADING…';
  });

  return audio;
}

/** 尝试播放;被浏览器自动播放策略拦截时降级为提示用户点击 */
function attempt() {
  const a = ensure();
  const p = a.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => { player.status = '点击播放'; });
  }
}

export const music = {
  /** 显示播放器并开始播放(进入"加入"页时调用) */
  showAndPlay() {
    ensure();
    player.visible = true;
    attempt();
  },

  /** 收起播放器(音乐继续播,不打断) */
  hide() {
    player.visible = false;
  },

  /** 播放 / 暂停 */
  toggle() {
    const a = ensure();
    if (a.paused) attempt();
    else a.pause();
  },

  /** 彻底停止并收起 */
  close() {
    if (!audio) return;
    audio.pause();
    player.visible = false;
  },

  setVolume(v) {
    player.volume = Number(v);
    if (audio) audio.volume = player.volume / 100;
  },
};
