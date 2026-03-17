<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import { generateId } from '@/utils/uuid'
import type { JobProfileQuestion, QuestionType } from '@/types/recruitment'

const modelValue = defineModel<JobProfileQuestion[]>({ required: true })

const typeOptions = [
  { label: 'Sí / No', value: 'yes_no' as QuestionType },
  { label: 'Texto', value: 'text' as QuestionType },
]

const sortedQuestions = computed(() =>
  [...modelValue.value].sort((a, b) => a.sortOrder - b.sortOrder),
)

function addQuestion() {
  const maxOrder = modelValue.value.reduce((max, q) => Math.max(max, q.sortOrder), 0)
  const newQuestion: JobProfileQuestion = {
    id: generateId(),
    type: 'yes_no',
    questionText: '',
    isRequired: false,
    sortOrder: maxOrder + 1,
  }
  modelValue.value = [...modelValue.value, newQuestion]
}

function removeQuestion(id: string) {
  modelValue.value = modelValue.value.filter((q) => q.id !== id)
}

function updateQuestion(id: string, field: keyof JobProfileQuestion, value: unknown) {
  modelValue.value = modelValue.value.map((q) =>
    q.id === id ? { ...q, [field]: value } : q,
  )
}

function moveUp(index: number) {
  if (index <= 0) return
  const items = [...sortedQuestions.value]
  const prev = items[index - 1]
  const curr = items[index]
  if (!prev || !curr) return
  const prevOrder = prev.sortOrder
  const currOrder = curr.sortOrder
  modelValue.value = modelValue.value.map((q) => {
    if (q.id === curr.id) return { ...q, sortOrder: prevOrder }
    if (q.id === prev.id) return { ...q, sortOrder: currOrder }
    return q
  })
}

function moveDown(index: number) {
  if (index >= sortedQuestions.value.length - 1) return
  const items = [...sortedQuestions.value]
  const next = items[index + 1]
  const curr = items[index]
  if (!next || !curr) return
  const nextOrder = next.sortOrder
  const currOrder = curr.sortOrder
  modelValue.value = modelValue.value.map((q) => {
    if (q.id === curr.id) return { ...q, sortOrder: nextOrder }
    if (q.id === next.id) return { ...q, sortOrder: currOrder }
    return q
  })
}
</script>

<template>
  <div>
    <div class="mb-3 flex items-center justify-between">
      <label class="text-sm font-medium text-color">Preguntas de filtrado</label>
      <Button icon="pi pi-plus" label="Agregar" size="small" text @click="addQuestion" />
    </div>

    <div v-if="sortedQuestions.length === 0" class="rounded-lg border border-surface p-4 text-center text-sm text-muted-color">
      Sin preguntas configuradas
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(question, idx) in sortedQuestions"
        :key="question.id"
        class="flex items-start gap-2 rounded-lg border border-surface bg-surface-0 p-3 dark:bg-surface-900"
      >
        <!-- Reorder -->
        <div class="flex flex-col gap-0.5 pt-1">
          <button
            type="button"
            class="rounded p-0.5 text-muted-color hover:text-color disabled:opacity-30"
            :disabled="idx === 0"
            @click="moveUp(idx)"
          >
            <i class="pi pi-chevron-up text-xs" />
          </button>
          <button
            type="button"
            class="rounded p-0.5 text-muted-color hover:text-color disabled:opacity-30"
            :disabled="idx === sortedQuestions.length - 1"
            @click="moveDown(idx)"
          >
            <i class="pi pi-chevron-down text-xs" />
          </button>
        </div>

        <!-- Fields -->
        <div class="flex flex-1 flex-col gap-2">
          <InputText
            :model-value="question.questionText"
            placeholder="Texto de la pregunta"
            class="w-full"
            @update:model-value="updateQuestion(question.id, 'questionText', $event)"
          />
          <div class="flex items-center gap-3">
            <Select
              :model-value="question.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              class="w-32"
              @update:model-value="updateQuestion(question.id, 'type', $event)"
            />
            <div class="flex items-center gap-2">
              <Checkbox
                :model-value="question.isRequired"
                :input-id="`req-${question.id}`"
                :binary="true"
                @update:model-value="updateQuestion(question.id, 'isRequired', $event)"
              />
              <label :for="`req-${question.id}`" class="text-sm text-color">Obligatoria</label>
            </div>
          </div>
        </div>

        <!-- Remove -->
        <Button
          icon="pi pi-times"
          text
          severity="danger"
          size="small"
          class="mt-1"
          @click="removeQuestion(question.id)"
        />
      </div>
    </div>
  </div>
</template>
