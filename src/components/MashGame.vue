<script setup lang="ts">
import {ref, reactive, computed} from 'vue'
import type {Category, FlattenedOption} from '@/types'
import config from '../config/categories.json'
import '../assets/mashgame.css'

const initCategories = (): Category[] => {
  return config.categories.map(cat => {
    const isConstant = (cat as any).isConstant || false
    let options = cat.options.map(opt => ({...opt}))

    // If not constant and empty, initialize with 4 empty options
    if (!isConstant && options.length === 0) {
      options = Array.from({length: 4}, () => ({text: '', eliminated: false, result: false}))
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
      options: [
        {text: '', eliminated: false, result: false},
        {text: '', eliminated: false, result: false},
        {text: '', eliminated: false, result: false},
        {text: '', eliminated: false, result: false}
      ]
    })
    newCategoryName.value = ''
  }
}

const addOption = (catIdx: number) => {
  if (categories[catIdx].options.length < 5) {
    categories[catIdx].options.push({text: '', eliminated: false, result: false})
  }
}

const removeOption = (catIdx: number, optIdx: number) => {
  if (categories[catIdx].options.length > 4) {
    categories[catIdx].options.splice(optIdx, 1)
  }
}

const magicNumber = ref<number | null>(null)
const isSpinning = ref(false)
const gameFinished = ref(false)

const allOptionsFilled = computed(() => {
  return categories.every(cat =>
      (cat.options.length === 4 || cat.options.length === 5) &&
      cat.options.every(opt => opt.text.trim() !== '')
  )
})

const startElimination = () => {
  if (!magicNumber.value) {
    magicNumber.value = Math.floor(Math.random() * 5) + 3 // Random number between 3 and 7
  }
  isSpinning.value = true
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
    await new Promise(resolve => setTimeout(resolve, 800))

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
  isSpinning.value = false
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
              :disabled="category.isConstant || isSpinning"
              :placeholder="'Option ' + (optIdx + 1)"
          />
          <button
              v-if="!category.isConstant && category.options.length > 4"
              @click="removeOption(catIdx, optIdx)"
              class="remove-opt-btn"
              :disabled="isSpinning"
          >
            ×
          </button>
          <span v-if="option.eliminated" class="eliminated">X</span>
          <span v-if="option.result" class="result-check">✓</span>
        </div>
        <button
            v-if="!category.isConstant && category.options.length < 5"
            @click="addOption(catIdx)"
            class="add-opt-btn"
            :disabled="isSpinning"
        >
          + Add Option
        </button>
      </div>

      <div class="add-category category-card">
        <h3>Add Category</h3>
        <div class="option-input">
          <input
              v-model="newCategoryName"
              placeholder="Category Name"
              @keyup.enter="addCategory"
              :disabled="isSpinning"
          />
        </div>
        <button @click="addCategory" :disabled="!newCategoryName.trim() || isSpinning" class="add-btn">
          + Add
        </button>
      </div>

      <div class="controls">
        <div v-if="magicNumber" class="magic-number-display">
          Chosen Number: <span>{{ magicNumber }}</span>
        </div>
        <p v-if="!allOptionsFilled && !isSpinning" class="warning">
          Each category must have 4 or 5 options filled!
        </p>
        <button
            @click="startElimination"
            :disabled="!allOptionsFilled || isSpinning"
        >
          {{ isSpinning ? 'Eliminating...' : 'Start Game' }}
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
