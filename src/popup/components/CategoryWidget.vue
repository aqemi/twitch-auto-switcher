<script lang="ts" setup>
import { syncStorageAdapter, useStorageOptions } from '@/libs/storage-adapter';
import { TwitchAPI } from '@/libs/twitch-api';
import { UserSettings } from '@/libs/user-settings';
import { translate } from '@/libs/utils';
import { type NextCategory, type NextTarget, NextTargetType } from '@/types/next-target.interface';
import { useStorageAsync } from '@vueuse/core';
import { computed } from 'vue';
import { buildCategoriesList } from '../utils/list.util';
// import Dropdown from './Dropdown.vue';

interface CategoryWidgetProps {
  nextTarget: NextTarget;
  disabled?: boolean;
}
const props = defineProps<CategoryWidgetProps>();

interface CategoryWidgetEmits {
  (e: 'update:nextTarget', value: NextTarget): void;
}
const emit = defineEmits<CategoryWidgetEmits>();

const lastSelectedCategory = useStorageAsync<NextCategory>('lastSelectedCategory', null, syncStorageAdapter, {
  ...useStorageOptions,
});

const category = computed<NextCategory>({
  get() {
    return props.nextTarget.type === NextTargetType.Category ? props.nextTarget : lastSelectedCategory.value;
  },
  set(value) {
    emit('update:nextTarget', value);
    lastSelectedCategory.value = value;
  },
});

// private lastSelectedCategory: NextCategory | null = null;

// get category(): NextCategory | null {
//   return this.nextTarget?.type === NextTargetType.Category ? this.nextTarget : this.lastSelectedCategory;
// }

// set category(value: NextCategory | null) {
//   this.$emit('input', value);
//   UserSettings.setLastSelectedCategory(value!);
// }

// public async created() {
//   try {
//     this.lastSelectedCategory =
//       this.nextTarget?.type === NextTargetType.Category
//         ? this.nextTarget
//         : await UserSettings.getLastSelectedCategory();

//     if (this.lastSelectedCategory) {
//       this.$emit('input', this.lastSelectedCategory);
//     }
//   } catch (err) {
//     console.error('Encountered error on initialization', err);
//   }
// }

async function searchCategories(term: string) {
  try {
    if (!term) {
      const topCategories = await TwitchAPI.getTopCategories();
      return buildCategoriesList(topCategories);
    } else {
      const categories = await TwitchAPI.searchCategories(term);
      return buildCategoriesList(categories);
    }
  } catch (err) {
    console.error('Error on getting list', err);
  }
}
</script>

<template>
  <div>{{ nextTarget }}</div>
  <!-- <Dropdown
    class="mg-t-1 mg-b-1 pd-l-24"
    v-model="category"
    v-bind:disabled="disabled"
    v-bind:placeholder="translate('selectCategory')"
    v-bind:inputPlaceholder="translate('searchCategory')"
    displayProp="value"
    imageProp="image"
    idProp="id"
    v-bind:getOptions="searchCategories"
  ></Dropdown> -->
</template>
