<script setup lang="ts">
import config from '../config/categories.json'
import {MashGameController} from '../logic/MashGameController'
import {ICONS} from '../utils/constants'
import '../assets/mashgame.css'

const game = new MashGameController()

const {
  categories,
  magicNumber,
  isGameRunning,
  gameFinished,
  allOptionsFilled,
  activeOption,
  hasDuplicateOptions,
  canStartGame
} = game
</script>

<template>
  <div class="mash-game-container">
    <div class="mash-game">
      <div v-if="!gameFinished" class="setup">
        <div v-for="(category, catIdx) in categories" :key="category.id" class="category-card">
          <div class="category-header">
            <h3 v-if="category.isConstant">{{ category.name }}</h3>
            <input
                v-else
                v-model="category.name"
                class="category-name-edit"
                :disabled="isGameRunning"
                placeholder="Category Name"
            />
          </div>
          <div v-for="(option, optIdx) in category.options" :key="option.id" class="option-input" :class="{
          'active-option': activeOption?.catIdx === catIdx && activeOption?.optIdx === optIdx,
          'final-result': option.result,
          'duplicate-option': game.isOptionDuplicate(catIdx, optIdx)
        }">
            <input
                v-model="option.text"
                :disabled="category.isConstant || isGameRunning"
                :placeholder="'Option ' + (optIdx + 1)"
            />
            <button
                v-if="!category.isConstant && category.options.length > config.optionsAmountMin && !isGameRunning"
                @click="game.removeOption(catIdx, optIdx)"
                class="remove-opt-btn"
            >
              {{ ICONS.TRASH }}
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
          <button
              v-if="!category.isConstant && !isGameRunning"
              @click="game.removeCategory(catIdx)"
              class="remove-cat-btn"
              title="Remove Category"
          >
            {{ ICONS.TRASH }} Remove Category
          </button>
        </div>

        <div v-if="!isGameRunning" class="add-category-container">
          <button @click="game.addCategory()" :disabled="isGameRunning" class="add-category-btn">
            + Add Category
          </button>
        </div>

        <div class="controls">
          <div v-if="magicNumber" class="magic-number-display">
            Chosen Number: <span>{{ magicNumber }}</span>
          </div>
          <p v-if="(!allOptionsFilled || hasDuplicateOptions) && !isGameRunning" class="disclaimer">
            For the game to begin please fill each category's options with unique values. It may have between
            {{ config.optionsAmountMin }}
            and {{ config.optionsAmountMax }} options
            filled
          </p>
          <button
              @click="game.startElimination()"
              :disabled="!canStartGame || isGameRunning"
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
        <div class="result-actions">
          <button @click="game.resetGame()">Play again from scratch</button>
          <button @click="game.playAgainWithSameOptions()" class="secondary-btn">Play again with same options</button>
        </div>
      </div>
    </div><!-- end of .mash-game -->
    <div class="instructions-panel">
      <h3>How to Play</h3>
      <p>1. Fill in each category with unique options.</p>
      <p>2. Click "Start Game" to begin the elimination process.</p>
      <p>3. A random "Magic Number" will be chosen.</p>
      <p>4. The game will eliminate options until only one remains in each category.</p>
      <p>5. Discover your future!</p>
      <a href="https://lifehacker.com/how-to-play-mash-1809951633" target="_blank" rel="noopener">Learn more on
        Lifehacker</a>
    </div>
  </div>
</template>
