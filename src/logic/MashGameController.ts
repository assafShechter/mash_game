import {reactive, ref, computed} from 'vue'
import type {Category, FlattenedOption} from '@/types'
import config from '../config/categories.json'
import {generateId} from '../utils/id'

export class MashGameController {
    public categories = reactive<Category[]>([])
    public magicNumber = ref<number | null>(null)
    public isGameRunning = ref(false)
    public gameFinished = ref(false)
    public newEliminatedOption = ref<FlattenedOption | null>(null)
    public activeOption = ref<FlattenedOption | null>(null)
    private playSpeedMS = 500

    constructor() {
        this.init()
    }

    private createEmptyOption() {
        return {
            id: generateId(),
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
            let options = cat.options.map(opt => ({
                id: generateId(),
                ...opt
            })) as any[]

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
        this.categories.push({
            id: Date.now().toString(),
            name: '',
            isConstant: false,
            options: this.createDefaultOptions()
        })
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

    public removeCategory(catIdx: number) {
        if (!this.categories[catIdx].isConstant) {
            this.categories.splice(catIdx, 1)
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

    public hasDuplicateOptions = computed(() => {
        return this.categories.some(cat => {
            const texts = cat.options.map(o => o.text.trim().toLowerCase()).filter(t => t !== '')
            const uniqueTexts = new Set(texts)
            return uniqueTexts.size !== texts.length
        })
    })

    public isOptionDuplicate(catIdx: number, optIdx: number): boolean {
        const category = this.categories[catIdx]
        const option = category.options[optIdx]
        const text = option.text.trim().toLowerCase()
        if (text === '') return false

        return category.options.some((o, idx) =>
            idx !== optIdx && o.text.trim().toLowerCase() === text
        )
    }

    public allCategoriesNamed = computed(() => {
        return this.categories.every(cat => cat.name.trim() !== '')
    })

    public canStartGame = computed(() => {
        return this.allCategoriesNamed.value && this.allOptionsFilled.value && !this.hasDuplicateOptions.value
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
        let eliminatedOptionIndex = 0
        const n = this.magicNumber.value!

        while (this.categories.some(cat => cat.options.filter(o => !o.eliminated).length > 1)) {
            // We advance one less to compensate for the previously eliminated option
            let jumpSize = n - 1;
            for (let i: number = 0; i < jumpSize; i++) {
                this.activeOption.value = flattenedOptions[(eliminatedOptionIndex + i) % flattenedOptions.length]
                await new Promise(resolve => setTimeout(resolve, this.playSpeedMS))
            }
            eliminatedOptionIndex = (eliminatedOptionIndex + jumpSize) % flattenedOptions.length

            this.activeOption.value = null
            this.newEliminatedOption.value = flattenedOptions[eliminatedOptionIndex]

            // Give time to see the new eliminated option
            await new Promise(resolve => setTimeout(resolve, this.playSpeedMS * 2))

            this.newEliminatedOption.value = null

            const toEliminate = flattenedOptions[eliminatedOptionIndex]
            this.categories[toEliminate.catIdx].options[toEliminate.optIdx].eliminated = true

            const remainingInCat = this.categories[toEliminate.catIdx].options.filter(o => !o.eliminated)
            if (remainingInCat.length === 1) {
                remainingInCat[0].result = true
            }

            updateFlattened()
            if (flattenedOptions.length === 0) break
            eliminatedOptionIndex = eliminatedOptionIndex % flattenedOptions.length
        }

        this.finalizeGame()
    }

    private markAllResults() {
        this.categories.forEach(cat => {
            const remaining = cat.options.find(o => !o.eliminated)
            if (remaining) remaining.result = true
        })
    }

    private finalizeGame() {
        this.newEliminatedOption.value = null
        this.activeOption.value = null
        this.isGameRunning.value = false
        this.gameFinished.value = true
        this.markAllResults()
    }

    private clearGameState() {
        this.magicNumber.value = null
        this.gameFinished.value = false
        this.isGameRunning.value = false
        this.newEliminatedOption.value = null
        this.activeOption.value = null
    }

    public resetCategories() {
        this.init()
    }

    public resetGame() {
        this.init()
        this.clearGameState()
    }

    public playAgainWithSameOptions() {
        this.categories.forEach(cat => {
            cat.options.forEach(opt => {
                opt.eliminated = false
                opt.result = false
            })
        })
        this.clearGameState()
    }
}
