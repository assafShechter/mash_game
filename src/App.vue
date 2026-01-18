<script setup lang="ts">
import MashGame from './components/MashGame.vue'
</script>

<template>
  <div class="container">
    <h1>MASH Game</h1>
    <MashGame/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
