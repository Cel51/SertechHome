<script setup lang="ts">
import { categorizedActions } from './services/actions'
import { useStorage } from '@vueuse/core'

const userId = useStorage('userId')
const actions = useStorage('actions', {});

const input = ref(null)
const query = ref()
const currentAction = ref()

const defineShortcode = () => {
  if (!query.value) {
    currentAction.value = null;
    return
  }
  const regex = /^\s*(\S+)/
  const queryFirstParameters = Array.isArray(query.value.match(regex)) ? query.value.match(regex)[0] : null

  if (queryFirstParameters) {
    currentAction.value = parsedActions.value.find((elem) => {
      return elem.sc === queryFirstParameters
    })
  } else {
    currentAction.value = null;
  }
}

const handleAction = () => {
  if (currentAction.value && currentAction.value.action) {
    // remove currentAction.sc with space before passing it to the action
    const regex = new RegExp(`${currentAction.value.sc}\\s`)
    const valueToPass = query.value.replace(regex, '')

    console.log(currentAction.value.action)

    currentAction.value.action(valueToPass, userId.value);

  } else {
    window.location = `https://www.google.com/search?q=${encodeURIComponent(query.value)}`
  }
}

const parsedActions = computed(() => {
  try {
    // Parse the actions from storage
    const actions = JSON.parse(JSON.parse(useStorage('actions').value)).actions;

    // Recreate the actions with the stringified function
    return actions.map((item: any) => {
      try {
        // Check if item.action is a string and try to create a function from it
        const actionFunction = new Function('query', item.action); // 'query' is the function argument

        return {
          ...item,
          action: actionFunction, // Assign the newly created function
        };
      } catch (e) {
        console.error('Error creating function from action string:', item.action, e);
        return {
          ...item,
          action: () => { console.error('Invalid action function body'); }, // Fallback function
        };
      }
    });
  } catch (e) {
    console.error('Error parsing actions from storage:', e);
    return [];
  }
});

const transformedActions = computed(() => {
  return categorizedActions(parsedActions.value);
})


onMounted(() => {
  input.value.input.focus()
})

</script>

<template>
  <div class="p-8 space-y-8 mb-8">

    <div class="text-3xl">
      Home
    </div>

    <UInput ref="input" v-model="query" @keyup="defineShortcode" @keyup.enter="handleAction">
      <template v-if="currentAction" #trailing>
        <div>
          {{ currentAction.label }}
        </div>
      </template>
    </UInput>

    <div class="grid grid-cols-4 gap-4 items-start">
      <div v-for="category in transformedActions">
        <div class="font-bold border-l border-t border-r border-gray-700 p-2 rounded-t">
          {{ category.category }}
        </div>
        <div class="bg-gray-700 p-2" v-if="category.actions.length > 0">
          <div class="flex justify-between" v-for="action in category.actions">
            <div class="flex italic cursor-pointer" @click="action.action(' ')">
              <div class="w-12">
                <UKbd>{{ action.sc }}</UKbd>
              </div>
              {{ action.label }}
            </div>
          </div>
        </div>
        <div class="" v-for="subcategory in category.subcategories">
          <div class="border-l border-t border-r border-gray-700 p-2">
            {{ subcategory.category }}
          </div>
          <div class="bg-gray-700 p-2 ">
            <div class="flex justify-between" v-for="action in subcategory.actions">
              <div class="flex italic cursor-pointer" @click="action.action(' ')">
                <div class="w-12">
                  <UKbd>{{ action.sc }}</UKbd>
                </div>
                {{ action.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 bg-gray-950 w-full p-2 flex">
    <div class="flex gap-2 items-center">
      <div>User Id:</div>
      <UInput type="text" v-model="userId"></UInput>
    </div>
    <div class="flex gap-2 items-center">
      <div>Actions:</div>
      <UInput type="text" v-model="actions"></UInput>
    </div>
  </div>
</template>