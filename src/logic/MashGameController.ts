import {reactive, ref, computed} from 'vue'
import type {Category, FlattenedOption} from '@/types'
import config from '../config/categories.json'

export class MashGameController {
    public categories = reactive<Category[]>([])
    public magicNumber = ref<number | null>(null)
    public isGameRunning = ref(false)
    public gameFinished = ref(false)
    public newCategoryName = ref('')
    private playRhythmMS = 800

    constructor() {
        this.init()
    }

    private createEmptyOption() {
        return {
            text: '',
            eliminated: false,
            result: false
        }
    }

    private createDefaultOptions() {
        return Array.from({length: config.optionsAmountMin}, () => this.createEmptyOption())
    }

    private init() {
        const initialCategories: Category[] = config.categories.map(cat => {
            const isConstant = (cat as any).isConstant || false
            let options = cat.options.map(opt => ({...opt}))

            if (!isConstant && options.length === 0) {
                options = this.createDefaultOptions()
            }

            return {
                id: cat.id,
                name: cat.name,
                isConstant,
                options
            }
        })
        this.categories.splice(0, this.categories.length, ...initialCategories)
    }

    public addCategory() {
        if (this.newCategoryName.value.trim()) {
            this.categories.push({
                id: Date.now().toString(),
                name: this.newCategoryName.value.trim(),
                isConstant: false,
                options: this.createDefaultOptions()
            })
            this.newCategoryName.value = ''
        }
    }

    public addOption(catIdx: number) {
        if (this.categories[catIdx].options.length < config.optionsAmountMax) {
            this.categories[catIdx].options.push(this.createEmptyOption())
        }
    }

    public removeOption(catIdx: number, optIdx: number) {
        if (this.categories[catIdx].options.length > config.optionsAmountMin) {
            this.categories[catIdx].options.splice(optIdx, 1)
        }
    }

    // TODO: make this less eager and will make app a bit smoother
    public allOptionsFilled = computed(() => {
        return this.categories.every(cat =>
            cat.options.length >= config.optionsAmountMin &&
            cat.options.length <= config.optionsAmountMax &&
            cat.options.every(opt => opt.text.trim() !== '')
        )
    })

    public startElimination() {
        if (!this.magicNumber.value) {
            const min = config.magicNumberMin
            const max = config.magicNumberMax
            this.magicNumber.value = Math.floor(Math.random() * (max - min + 1)) + min
        }
        this.isGameRunning.value = true
        this.runElimination()
    }

    private async runElimination() {
        let flattenedOptions: FlattenedOption[] = []

        const updateFlattened = () => {
            flattenedOptions = []
            this.categories.forEach((cat, catIdx) => {
                cat.options.forEach((opt, optIdx) => {
                    if (!opt.eliminated && !opt.result) {
                        flattenedOptions.push({catIdx, optIdx})
                    }
                })
            })
        }

        updateFlattened()
        let currentIndex = 0
        const n = this.magicNumber.value!

        while (this.categories.some(cat => cat.options.filter(o => !o.eliminated).length > 1)) {
            currentIndex = (currentIndex + (n - 1)) % flattenedOptions.length

            const toEliminate = flattenedOptions[currentIndex]
            this.categories[toEliminate.catIdx].options[toEliminate.optIdx].eliminated = true

            const remainingInCat = this.categories[toEliminate.catIdx].options.filter(o => !o.eliminated)
            if (remainingInCat.length === 1) {
                remainingInCat[0].result = true
            }

            await new Promise(resolve => setTimeout(resolve, this.playRhythmMS))

            updateFlattened()
            if (flattenedOptions.length === 0) break
            currentIndex = currentIndex % flattenedOptions.length
        }

        this.categories.forEach(cat => {
            const remaining = cat.options.find(o => !o.eliminated)
            if (remaining) remaining.result = true
        })

        this.gameFinished.value = true
        this.isGameRunning.value = false
    }

    public resetCategories() {
        this.init()
    }

    public resetGame() {
        this.init()
        this.magicNumber.value = null
        this.gameFinished.value = false
    }
}
