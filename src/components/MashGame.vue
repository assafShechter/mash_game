<script setup lang="ts">
import {ref, reactive, computed} from 'vue'
import type {Category, FlattenedOption} from '@/types'
import config from '../config/categories.json'
import '../assets/mashgame.css'

const playRhythmMS = 800;

const createDefaultOptions = () => Array.from({length: config.optionsAmountMin}, () => ({
  text: '',
  eliminated: false,
  result: false
}))

const initCategories = (): Category[] => {
  return config.categories.map(cat => {
    const isConstant = (cat as any).isConstant || false
    let options = cat.options.map(opt => ({...opt}))

    // If not constant and empty, initialize with config.optionsAmountMin empty options
    if (!isConstant && options.length === 0) {
      options = createDefaultOptions()
    }

    return {
      id: cat.id,
      name: cat.name,
      isConstant,
      options
    }
  })
}

const categories = reactive<Category[]>(initCategories())

const newCategoryName = ref('')

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    categories.push({
      id: Date.now().toString(),
      name: newCategoryName.value.trim(),
      isConstant: false,
      options: createDefaultOptions()
    })
    newCategoryName.value = ''
  }
}

const addOption = (catIdx: number) => {
  if (categories[catIdx].options.length < config.optionsAmountMax) {
    categories[catIdx].options.push({text: '', eliminated: false, result: false})
  }
}

const removeOption = (catIdx: number, optIdx: number) => {
  if (categories[catIdx].options.length > config.optionsAmountMin) {
    categories[catIdx].options.splice(optIdx, 1)
  }
}

const magicNumber = ref<number | null>(null)
const isGameRunning = ref(false)
const gameFinished = ref(false)

const allOptionsFilled = computed(() => {
  return categories.every(cat =>
      cat.options.length >= config.optionsAmountMin &&
      cat.options.length <= config.optionsAmountMax &&
      cat.options.every(opt => opt.text.trim() !== '')
  )
})

const startElimination = () => {
  if (!magicNumber.value) {
    const min = config.magicNumberMin
    const max = config.magicNumberMax
    // Sets "magicNumber" to be between min and max
    magicNumber.value = Math.floor(Math.random() * (max - min + 1)) + min
  }
  isGameRunning.value = true
  runElimination()
}

const runElimination = async () => {
  let flattenedOptions: FlattenedOption[] = []

  const updateFlattened = () => {
    flattenedOptions = []
    categories.forEach((cat, catIdx) => {
      cat.options.forEach((opt, optIdx) => {
        if (!opt.eliminated && !opt.result) {
          flattenedOptions.push({catIdx, optIdx})
        }
      })
    })
  }

  updateFlattened()
  let currentIndex = 0
  const n = magicNumber.value!

  while (categories.some(cat => cat.options.filter(o => !o.eliminated).length > 1)) {
    // Count n steps
    for (let i = 0; i < n - 1; i++) {
      currentIndex = (currentIndex + 1) % flattenedOptions.length
    }

    // Eliminate option at currentIndex
    const toEliminate = flattenedOptions[currentIndex]
    categories[toEliminate.catIdx].options[toEliminate.optIdx].eliminated = true

    // Check if the category now has only one option left
    const remainingInCat = categories[toEliminate.catIdx].options.filter(o => !o.eliminated)
    if (remainingInCat.length === 1) {
      remainingInCat[0].result = true
    }

    // Delay for animation effect
    await new Promise(resolve => setTimeout(resolve, playRhythmMS))

    updateFlattened()
    if (flattenedOptions.length === 0) break
    currentIndex = currentIndex % flattenedOptions.length
  }

  // Mark all remaining as results
  categories.forEach(cat => {
    const remaining = cat.options.find(o => !o.eliminated)
    if (remaining) remaining.result = true
  })

  gameFinished.value = true
  isGameRunning.value = false
}

const resetGame = () => {
  const initial = initCategories()
  categories.splice(0, categories.length, ...initial)
  magicNumber.value = null
  gameFinished.value = false
}
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
              @click="removeOption(catIdx, optIdx)"
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
            @click="addOption(catIdx)"
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
              @keyup.enter="addCategory"
              :disabled="isGameRunning"
          />
        </div>
        <button @click="addCategory" :disabled="!newCategoryName.trim() || isGameRunning" class="add-btn">
          + Add
        </button>
      </div>

      <div class="controls">
        <div v-if="magicNumber" class="magic-number-display">
          Chosen Number: <span>{{ magicNumber }}</span>
        </div>
        <p v-if="!allOptionsFilled && !isGameRunning" class="warning">
          For the game to begin please fill each category's options. It may have between {{ config.optionsAmountMin }}
          and {{ config.optionsAmountMax }} options
          filled
        </p>
        <button
            @click="startElimination"
            :disabled="!allOptionsFilled || isGameRunning"
        >
          {{ isGameRunning ? 'Eliminating...' : 'Start Game' }}
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
      <button @click="resetGame">Play Again</button>
    </div>
  </div>
</template>
