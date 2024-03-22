<script setup lang="ts">
import { syncStorageAdapter, useStorageOptions } from '@/libs/storage-adapter';
import { translate } from '@/libs/utils';
import type { UiOption } from '@/types/option.interface';
import { useStorageAsync } from '@vueuse/core';
import { camelCase } from 'lodash-es';
import { computed, type Component } from 'vue';
import { CommonOptionValue, NextTargetType, type NextTarget } from '../types/next-target.interface';
import CategoryWidget from './components/CategoryWidget.vue';
import RadioButton from './components/RadioButton.vue';
import { buildAllOptionsList, isCommonOption, nextTargetToUiOption } from './utils/list.util';

const isEnabled = useStorageAsync<boolean>('enabled', true, syncStorageAdapter, {
  ...useStorageOptions,
});

const defaultNextTarget: NextTarget = {
  type: NextTargetType.Common,
  value: CommonOptionValue.Current,
};
const nextTarget = useStorageAsync<NextTarget>('nextTarget', defaultNextTarget, syncStorageAdapter, {
  ...useStorageOptions,
});

const selectedOption = computed<UiOption>({
  get: () => nextTargetToUiOption(nextTarget.value),
  set: (value) => {
    if (isCommonOption(value)) {
      nextTarget.value = value;
    }
  },
});

const options = buildAllOptionsList();

function translateOption(option: UiOption) {
  return translate(camelCase(getOptionKey(option)));
}

function getOptionKey(option: UiOption): string {
  return 'value' in option ? `option_${option.type}_${option.value}` : `option_${option.type}`;
}

function resolveWidget(option: UiOption): Component | undefined {
  if (option.type === NextTargetType.Category && selectedOption.value.type === NextTargetType.Category) {
    return CategoryWidget;
  }
}
</script>

<template>
  <div class="container" v-cloak>
    <div class="section section--justify">
      <label for="enabled" class="label">{{ translate('enabledLabel') }}</label>
      <div class="tws-toggle">
        <input id="enabled" v-model="isEnabled" type="checkbox" class="tws-toggle__input" />
        <label for="enabled" class="tws-toggle__button"></label>
      </div>
    </div>

    <hr />

    <div class="section" v-bind:class="{ 'section--disabled': !isEnabled }">
      <label class="mg-b-05 label">{{ translate('nextTargetLabel') }}</label>

      <div class="mg-t-1 mg-b-1" v-for="option in options" v-bind:key="getOptionKey(option)">
        <RadioButton
          v-bind:disabled="!isEnabled"
          name="nextTarget"
          v-bind:value="option"
          v-model="selectedOption"
          v-bind:label="translateOption(option)"
        ></RadioButton>
        <component v-bind:is="resolveWidget(option)" v-model="nextTarget" v-bind:disabled="!isEnabled"></component>
      </div>
    </div>
  </div>
</template>

<style src="./styles/index.less" />
