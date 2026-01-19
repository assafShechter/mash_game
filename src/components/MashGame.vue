<script setup lang="ts">
import config from '../config/categories.json'
import {MashGameController} from '../logic/MashGameController'
import '../assets/mashgame.css'

const game = new MashGameController()

const {
  categories,
  newCategoryName,
  magicNumber,
  isGameRunning,
  gameFinished,
  allOptionsFilled
} = game
</script>

<template>
  <div class="mash-game">
    <div v-if="!gameFinished" class="setup">
      <div v-for="(category, catIdx) in categories" :key="category.id" class="category-card">
        <h3>{{ category.name }}</h3>
        <div v-for="(option, optIdx) in category.options" :key="optIdx" class="option-input">
          <input
              v-model="option.text"
              :disabled="category.isConstant || isGameRunning"
              :placeholder="'Option ' + (optIdx + 1)"
          />
          <button
              v-if="!category.isConstant && category.options.length > config.optionsAmountMin"
              @click="game.removeOption(catIdx, optIdx)"
              class="remove-opt-btn"
              :disabled="isGameRunning"
          >
            ×
          </button>
          <span v-if="option.eliminated" class="eliminated">X</span>
          <span v-if="option.result" class="result-check">✓</span>
        </div>
        <button
            v-if="!category.isConstant && category.options.length < config.optionsAmountMax"
            @click="game.addOption(catIdx)"
            class="add-opt-btn"
            :disabled="isGameRunning"
        >
          + Add Option
        </button>
      </div>

      <div v-if="!isGameRunning" class="add-category category-card">
        <h3>Add Category</h3>
        <div class="category-name-input">
          <input
              v-model="newCategoryName"
              placeholder="Category Name"
              @keyup.enter="game.addCategory()"
              :disabled="isGameRunning"
          />
        </div>
        <button @click="game.addCategory()" :disabled="!newCategoryName.trim() || isGameRunning" class="add-btn">
          + Add
        </button>
      </div>

      <div class="controls">
        <div v-if="magicNumber" class="magic-number-display">
          Chosen Number: <span>{{ magicNumber }}</span>
        </div>
        <p v-if="!allOptionsFilled && !isGameRunning" class="disclaimer">
          For the game to begin please fill each category's options. It may have between {{ config.optionsAmountMin }}
          and {{ config.optionsAmountMax }} options
          filled
        </p>
        <button
            @click="game.startElimination()"
            :disabled="!allOptionsFilled || isGameRunning"
        >
          {{ isGameRunning ? 'Eliminating...' : 'Start Game' }}
        </button>
        <button
            v-if="!isGameRunning"
            @click="game.resetCategories()"
            class="reset-categories-btn"
        >
          Reset Categories
        </button>
      </div>
    </div>

    <div v-else class="results">
      <div v-if="magicNumber" class="magic-number-display results-number">
        Chosen Number: <span>{{ magicNumber }}</span>
      </div>
      <h2>Your Future:</h2>
      <ul>
        <li v-for="category in categories" :key="category.id">
          <strong>{{ category.name }}:</strong> {{ category.options.find(o => o.result)?.text }}
        </li>
      </ul>
      <button @click="game.resetGame()">Play Again</button>
    </div>
  </div>
</template>
