<template>
  <Dropdown
    class="mg-t-1 mg-b-1 pd-l-24"
    v-model="category"
    v-bind:disabled="disabled"
    v-bind:placeholder="translate('selectCategory')"
    v-bind:inputPlaceholder="translate('searchCategory')"
    displayProp="value"
    imageProp="image"
    idProp="id"
    v-bind:getOptions="searchCategories"
  ></Dropdown>
</template>

<script lang="ts">
import { TwitchAPI } from '@/libs/twitch-api';
import { UserSettings } from '@/libs/user-settings';
import { translate } from '@/libs/utils';
import { NextCategory, NextTarget, NextTargetType } from '@/types/next-target.interface';
import Vue, { PropType } from 'vue';
import Component from 'vue-class-component';
import { buildCategoriesList } from '../utils/list.util';
import Dropdown from './Dropdown.vue';

const ComponentProps = Vue.extend({
  components: { Dropdown },
  model: {
    prop: 'nextTarget',
  },
  props: {
    nextTarget: {
      type: Object as PropType<NextTarget | null>,
      required: true,
    },
    disabled: Boolean,
  },
});

@Component({})
export default class CategoryWidget extends ComponentProps {
  private lastSelectedCategory: NextCategory | null = null;

  get category(): NextCategory | null {
    return this.nextTarget?.type === NextTargetType.Category ? this.nextTarget : this.lastSelectedCategory;
  }

  set category(value: NextCategory | null) {
    this.$emit('input', value);
    UserSettings.setLastSelectedCategory(value!);
  }

  public translate = translate;

  public async created() {
    try {
      this.lastSelectedCategory =
        this.nextTarget?.type === NextTargetType.Category
          ? this.nextTarget
          : await UserSettings.getLastSelectedCategory();

      if (this.lastSelectedCategory) {
        this.$emit('input', this.lastSelectedCategory);
      }
    } catch (err) {
      console.error('Encountered error on initialization', err);
    }
  }

  public async searchCategories(term: string) {
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
}
</script>
