<script setup lang="ts">
import {ref, reactive, computed} from 'vue'
import type {Category, FlattenedOption} from '../types'

const categories = reactive<Category[]>([
  {
    id: 'mash',
    name: 'MASH',
    options: [
      {text: 'Mansion', eliminated: false, result: false},
      {text: 'Apartment', eliminated: false, result: false},
      {text: 'Shack', eliminated: false, result: false},
      {text: 'House', eliminated: false, result: false}
    ]
  },
  {
    id: 'spouse',
    name: 'Spouse',
    options: [
      {text: '', eliminated: false, result: false},
      {text: '', eliminated: false, result: false},
      {text: '', eliminated: false, result: false}
    ]
  },
  {
    id: 'job',
    name: 'Job',
    options: [
      {text: '', eliminated: false, result: false},
      {text: '', eliminated: false, result: false},
      {text: '', eliminated: false, result: false}
    ]
  },
  {
    id: 'kids',
    name: 'Number of Kids',
    options: [
      {text: '', eliminated: false, result: false},
      {text: '', eliminated: false, result: false},
      {text: '', eliminated: false, result: false}
    ]
  }
])

const magicNumber = ref<number | null>(null)
const isSpinning = ref(false)
const gameFinished = ref(false)

const allOptionsFilled = computed(() => {
  return categories.every(cat => cat.options.every(opt => opt.text.trim() !== ''))
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

    // Check if category now has only one option left
    const remainingInCat = categories[toEliminate.catIdx].options.filter(o => !o.eliminated)
    if (remainingInCat.length === 1) {
      remainingInCat[0].result = true
    }

    // Delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 300))

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
  categories.forEach(cat => {
    cat.options.forEach(opt => {
      opt.eliminated = false
      opt.result = false
      if (cat.id !== 'mash') opt.text = ''
    })
  })
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
              :disabled="category.id === 'mash' || isSpinning"
              :placeholder="'Option ' + (optIdx + 1)"
          />
          <span v-if="option.eliminated" class="eliminated">X</span>
          <span v-if="option.result" class="result-check">✓</span>
        </div>
      </div>

      <div class="controls">
        <button
            @click="startElimination"
            :disabled="!allOptionsFilled || isSpinning"
        >
          {{ isSpinning ? 'Eliminating...' : 'Start Game' }}
        </button>
      </div>
    </div>

    <div v-else class="results">
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

<style scoped>
.mash-game {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setup {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.category-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  background: #f9f9f9;
}

.option-input {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  flex-grow: 1;
}

.eliminated {
  color: red;
  font-weight: bold;
}

.result-check {
  color: green;
  font-weight: bold;
}

.controls {
  grid-column: 1 / -1;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.results {
  padding: 20px;
  border: 2px solid #42b983;
  border-radius: 12px;
  background-color: #e7f7f0;
}

ul {
  list-style: none;
  padding: 0;
  font-size: 1.2rem;
  text-align: left;
  display: inline-block;
}

li {
  margin-bottom: 10px;
}
</style>
