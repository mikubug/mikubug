<script setup>
/** 右上角音乐播放器 —— 进入"加入"页时自动滑出并播放 */
import { music, player, MUSIC_TITLE } from '../lib/player';
</script>

<template>
  <div class="player" :class="{ show: player.visible }" role="region" aria-label="音乐播放器">
    <button class="player-btn" type="button" aria-label="播放 / 暂停" @click="music.toggle()">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path v-if="!player.playing" d="M8 5.14v13.72L19 12z" />
        <path v-else d="M6 5h4v14H6zM14 5h4v14h-4z" />
      </svg>
    </button>

    <div class="player-meta">
      <div class="player-title">{{ MUSIC_TITLE }}</div>
      <div class="player-sub">{{ player.status }}</div>
    </div>

    <div class="player-wave" :class="{ on: player.playing }" aria-hidden="true">
      <i></i><i></i><i></i><i></i>
    </div>

    <input
      class="player-vol"
      type="range"
      min="0"
      max="100"
      :value="player.volume"
      aria-label="音量"
      @input="music.setVolume($event.target.value)"
    />

    <button class="player-close" type="button" aria-label="关闭播放器" @click="music.close()">&times;</button>
  </div>
</template>
