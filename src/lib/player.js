/* player.js — 背景音乐播放器（全局单例）
   状态用 reactive 暴露给 MusicPlayer.vue，音频实例留在模块内。
   坑：'waiting' 会在正常缓冲时反复触发，只靠 play/pause 复位会永久卡在"缓冲中"；
   这里 waiting 延迟 300ms 才置 buffering，并由 playing / canplay / timeupdate 统一复位。 */

import { reactive } from 'vue';

export const MUSIC_TITLE = '梅花开时';
export const MUSIC_SRC = import.meta.env.BASE_URL + 'assets/music.ogg';

export const player = reactive({
  visible: false,      // 右上角播放器是否显示
  playing: false,      // 是否真的在出声（由 playing 事件驱动，不是 play 意图）
  buffering: false,    // 是否正在等数据
  status: 'NOW PLAYING',
  volume: 60,          // 0–100
});

let audio = null;
let bufferTimer = 0;

/** 结束"缓冲中"状态 */
function clearBuffering() {
  clearTimeout(bufferTimer);
  player.buffering = false;
}

/** 惰性创建音频元素：只在真正需要播放时才加载，不拖慢首屏 */
function ensure() {
  if (audio) return audio;

  audio = new Audio(MUSIC_SRC);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = player.volume / 100;

  // 真的开始出声
  audio.addEventListener('playing', () => {
    clearBuffering();
    player.playing = true;
    player.status = 'NOW PLAYING';
  });

  audio.addEventListener('pause', () => {
    clearBuffering();
    player.playing = false;
    player.status = 'PAUSED';
  });

  // 缓冲：短于 300ms 的抖动不打扰用户
  audio.addEventListener('waiting', () => {
    if (audio.paused) return;
    clearTimeout(bufferTimer);
    bufferTimer = setTimeout(() => {
      if (!audio.paused) {
        player.buffering = true;
        player.status = '缓冲中';
      }
    }, 300);
  });

  // 任何"数据到位"的信号都把状态复位（canplay/seeked/进度推进）
  const ready = () => {
    clearBuffering();
    if (!audio.paused) {
      player.playing = true;
      player.status = 'NOW PLAYING';
    }
  };
  audio.addEventListener('canplay', ready);
  audio.addEventListener('canplaythrough', ready);
  audio.addEventListener('seeked', ready);
  audio.addEventListener('loadeddata', ready);
  audio.addEventListener('progress', ready);
  audio.addEventListener('timeupdate', ready);   // 最保险：只要在推进就一定是在播

  audio.addEventListener('error', () => {
    clearBuffering();
    player.playing = false;
    player.status = '加载失败';
  });

  return audio;
}

/** 尝试播放；被浏览器自动播放策略拦截时降级为提示用户点击 */
function attempt() {
  const a = ensure();
  const p = a.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {
      clearBuffering();
      player.playing = false;
      player.status = '点击播放';
    });
  }
}

export const music = {
  /** 显示播放器并开始播放（进入"加入"页时调用） */
  showAndPlay() {
    ensure();
    player.visible = true;
    attempt();
  },

  /** 收起播放器（音乐继续播，不打断） */
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
    clearBuffering();
    audio.pause();
    player.visible = false;
  },

  setVolume(v) {
    player.volume = Number(v);
    if (audio) audio.volume = player.volume / 100;
  },
};
