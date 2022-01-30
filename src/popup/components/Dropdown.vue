<template>
  <div>
    <button
      class="tws-button tws-button--wide tws-button--secondary dropdown__button"
      v-bind:class="{ 'dropdown__button--open': isDropdownOpen }"
      v-bind:disabled="disabled"
      v-on:click.stop="toggle"
    >
      <span class="flex-grow ellipsis">{{ value ? value[displayProp] : placeholder }}</span>
      <div
        class="tws-button__icon tws-button__icon--right"
        v-bind:class="{ 'tws-button__icon--dropdown-open': isDropdownOpen }"
      >
        <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
          <g>
            <path d="M14.5 6.5L10 11 5.5 6.5 4 8l6 6 6-6-1.5-1.5z" />
          </g>
        </svg>
      </div>
    </button>
    <div v-if="isDropdownOpen" class="dropdown" v-on:click.stop>
      <div class="relative mg-b-1">
        <div class="tws-input__icon tws-input__icon--left">
          <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
            <g>
              <path
                fill-rule="evenodd"
                d="M13.192 14.606a7 7 0 111.414-1.414l3.101 3.1-1.414 1.415-3.1-3.1zM14 9A5 5 0 114 9a5 5 0 0110 0z"
                clip-rule="evenodd"
              />
            </g>
          </svg>
        </div>
        <div
          v-if="searchValue && !isLoading"
          class="tws-input__icon tws-input__icon--right tws-input__icon--action"
          v-on:click.prevent="resetInput"
        >
          <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
            <g>
              <path
                d="M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z"
              />
            </g>
          </svg>
        </div>
        <div v-if="isLoading" class="tws-input__icon tws-input__icon--right tws-spinner">
          <svg viewBox="22 22 44 44">
            <circle cx="44" cy="44" r="19.5" stroke-width="5" />
          </svg>
        </div>
        <input
          v-model="searchValue"
          type="text"
          class="tws-input pd-l-3 pd-r-3"
          v-bind:placeholder="inputPlaceholder"
          spellcheck="false"
          autocomplete="false"
          autocapitalize="off"
          autocorrect="off"
          v-on:keydown="navigate"
          v-on:input="search"
        />
      </div>

      <div class="dropdown__container" v-on:mouseleave="hover(-1)" v-click-outside="closeDropdown">
        <div
          v-for="item in list"
          v-bind:key="item[idProp]"
          v-bind:class="{
            'dropdown__section-item_hover': isHovered(item.index),
            'dropdown__section-item_selected': isSelected(item),
          }"
          class="dropdown__section-item"
          v-on:mousemove="hover(item.index)"
          v-on:click="select(item.index)"
        >
          <div
            v-if="imageProp"
            class="dropdown__section-item-icon dropdown__section-item-icon_left dropdown__section-item-icon_round"
          >
            <img v-bind:src="item[imageProp]" />
          </div>
          <div class="dropdown__section-item-text ellipsis" v-bind:title="item[displayProp]">
            {{ item[displayProp] }}
          </div>
          <div v-if="isSelected(item)" class="dropdown__section-item-icon dropdown__section-item-icon_right">
            <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
              <g><path d="M4 10l5 5 8-8-1.5-1.5L9 12 5.5 8.5 4 10z"></path></g>
            </svg>
          </div>
        </div>
      </div>
      <div v-if="searchValue && !list.length" class="dropdown__no-results">
        <figure>
          <svg type="color-fill-brand" width="36px" height="36px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
            <g>
              <path
                fill-rule="evenodd"
                d="M13.192 14.606a7 7 0 111.414-1.414l3.101 3.1-1.414 1.415-3.1-3.1zM14 9A5 5 0 114 9a5 5 0 0110 0z"
                clip-rule="evenodd"
              ></path>
            </g>
          </svg>
        </figure>
        <h4>{{ translate('noResults') }}</h4>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { translate } from '@/libs/utils';
import { debounce } from 'lodash-es';
import Vue, { PropType } from 'vue';
import Component from 'vue-class-component';
import { ClickOutside } from '../directives/click-outside';
import { followScroll } from '../utils/scroll.util';

const ComponentProps = Vue.extend({
  directives: { ClickOutside },
  props: {
    disabled: Boolean,
    placeholder: {
      type: String,
      required: true,
    },
    inputPlaceholder: {
      type: String,
      required: true,
    },
    displayProp: {
      type: String,
      required: true,
    },
    idProp: {
      type: String,
      required: true,
    },
    imageProp: {
      type: String,
      required: false,
    },
    getOptions: {
      type: Function as PropType<(term: string) => Promise<Record<string, any>[]>>,
      required: true,
    },
    value: Object as PropType<Record<string, any> | undefined>,
  },
});

@Component({})
export default class Dropdown extends ComponentProps {
  public isDropdownOpen = false;
  public isLoading = false;
  public searchValue = '';
  public list: Record<string, any>[] = [];
  public hoveredIndex = -1;
  public translate = translate;

  public debouncedSearch = debounce(this.search, 250);

  public async created() {
    await this.search();
  }

  public toggle() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.resetInput();
    }
  }

  public async select(index: number) {
    if (this.list[index]) {
      this.$emit('input', this.list[index]);
      this.closeDropdown();
    }
  }

  public hover(index: number) {
    this.hoveredIndex = index;
  }

  public isHovered(index: number) {
    return this.hoveredIndex === index;
  }

  public isSelected(item: Record<string, any>) {
    return this.value?.[this.displayProp] === item[this.displayProp];
  }

  public navigate(event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === 'ArrowUp' && this.hoveredIndex > 0) {
      this.hoveredIndex -= 1;
      this.highlightSelection();
      this.followScroll();
    }
    if (event.key === 'ArrowDown' && this.hoveredIndex < this.list.length - 1) {
      this.hoveredIndex += 1;
      this.highlightSelection();
      this.followScroll();
    }
    if (event.key === 'Enter') {
      this.select(this.hoveredIndex);
    }
  }

  private async resetInput() {
    this.searchValue = '';
    await this.search();
    this.focusInput();
  }

  private focusInput() {
    setTimeout(() => this.$el.querySelector('input')?.focus());
  }

  private closeDropdown() {
    this.isDropdownOpen = false;
  }

  private followScroll() {
    const dropdownElement = this.$el.querySelector<HTMLDivElement>('.dropdown__container'),
      itemElement = this.$el.querySelectorAll<HTMLDivElement>('.dropdown__section-item')[this.hoveredIndex];

    if (dropdownElement && itemElement) {
      followScroll(dropdownElement, itemElement, this.hoveredIndex);
    }
  }

  private highlightSelection() {
    const hovered = this.list[this.hoveredIndex];
    if (hovered) {
      this.searchValue = hovered[this.displayProp];
    }
  }

  private async search() {
    this.isLoading = true;
    this.hoveredIndex = -1;
    try {
      const list = await this.getOptions(this.searchValue);
      this.list = this.indexList(list);
    } catch (err) {
      console.error('Error on getting list', err);
    } finally {
      this.isLoading = false;
    }
  }

  private indexList(list: object[]) {
    return list.map((x, index) => ({ ...x, index }));
  }
}
</script>

<style lang="less" scoped>
.dropdown__button {
  .tws-button__icon {
    transition: transform ease 0.25s;
  }
  &--open {
    .tws-button__icon {
      transform: rotate(-900deg);
    }
  }
}

.dropdown {
  margin-top: 0.8rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 4px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 1rem;

  &__container {
    max-height: 384px;
    overflow: auto;
    position: relative; // setting offsetParent for dropdown__section-item for scrolling purposes
    &::-webkit-scrollbar {
      background-color: #fff;
      width: 4px;
    }

    /* background of the scrollbar except button or resizer */
    &::-webkit-scrollbar-track {
      background-color: #fff;
    }

    /* scrollbar itself */
    &::-webkit-scrollbar-thumb {
      background-color: #babac0;
      border-radius: 4px;
    }

    /* set button(top and bottom of the scrollbar) */
    &::-webkit-scrollbar-button {
      display: none;
    }
  }

  &__section-title {
    color: #53535f;
    font-weight: 600;
    text-transform: uppercase;
    line-height: 3rem;
    font-size: 1.3rem;
    padding: 0 0.5rem;
  }

  &__section-item {
    line-height: 3rem;
    font-size: 1.3rem;
    border-radius: 4px;
    padding: 0 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }
    &_hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    &_selected {
      background-color: #9147ff;
      color: #fff;
    }
  }

  &__section-item-text {
    flex-grow: 1;
  }
  &__section-item-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    height: 2rem;
    width: 2rem;
    img {
      width: 100%;
    }
    &_left {
      margin-right: 0.5rem;
    }
    &_right {
      margin-left: 2rem;
    }
    &_round {
      border-radius: 50%;
      overflow: hidden;
    }
  }

  &__no-results {
    padding: 5rem 0;
    text-align: center;
    svg {
      fill: #9147ff;
    }
    h4 {
      line-height: 1.5;
      font-weight: 600;
      font-size: 1.8rem;
    }
  }
}
</style>
