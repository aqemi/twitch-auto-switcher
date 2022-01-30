<template>
  <div class="container">
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

<script lang="ts">
import { translate } from '@/libs/utils';
import { Option } from '@/types/option.interface';
import { camelCase } from 'lodash-es';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { UserSettings } from '../libs/user-settings';
import { NextTarget, NextTargetType } from '../types/next-target.interface';
import CategoryWidget from './components/CategoryWidget.vue';
import RadioButton from './components/RadioButton.vue';
import { buildAllOptionsList, isCommonOption, nextTargetToOption } from './utils/list.util';

@Component({ components: { RadioButton } })
export default class App extends Vue {
  public isEnabled = false;
  public isLoading = false;
  public nextTarget?: NextTarget | null = null;
  public readonly options: Option[];
  public selectedOption: Option | null = null;

  constructor() {
    super();
    this.options = buildAllOptionsList();
  }

  public translate = translate;

  @Watch('isEnabled')
  public async onIsEnabledChanged() {
    await UserSettings.setEnabled(this.isEnabled);
  }

  @Watch('selectedOption')
  public async onSelect() {
    if (this.selectedOption && isCommonOption(this.selectedOption)) {
      this.nextTarget = this.selectedOption;
    }
  }

  @Watch('nextTarget')
  private async storeNextTarget() {
    if (!this.nextTarget) {
      throw new Error("Next target can't be empty!");
    }
    await UserSettings.setNextTarget(this.nextTarget);
  }

  public async created() {
    try {
      this.isEnabled = await UserSettings.isEnabled();
      this.nextTarget = await UserSettings.getNextTarget();
      this.selectedOption = nextTargetToOption(this.nextTarget);
    } catch (err) {
      console.error('Encountered error on initialization', err);
    }
  }

  public translateOption(option: Option) {
    return this.translate(camelCase(this.getOptionKey(option)));
  }

  public getOptionKey(option: Option): string {
    return 'value' in option ? `option_${option.type}_${option.value}` : `option_${option.type}`;
  }

  public resolveWidget(option: Option): typeof Vue | undefined {
    if (option.type === NextTargetType.Category && this.selectedOption?.type === NextTargetType.Category) {
      return CategoryWidget;
    }
  }
}
</script>

<style lang="less" src="./styles/index.less"></style>
