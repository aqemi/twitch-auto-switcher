<template>
  <div class="radio-button">
    <input
      v-bind:disabled="disabled"
      type="radio"
      v-bind:name="name"
      v-bind:value="value"
      v-bind:id="id"
      v-model="model"
    />
    <label v-bind:for="id">
      <div>{{ label }}</div>
    </label>
  </div>
</template>

<script lang="ts">
import { random } from '@/libs/utils';
import Vue from 'vue';
import Component from 'vue-class-component';

const ComponentProps = Vue.extend({
  model: {
    prop: 'modelValue',
  },
  props: {
    modelValue: {},
    value: {},
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    disabled: Boolean,
  },
});

@Component({})
export default class RadioButton extends ComponentProps {
  public readonly id = random();

  get model() {
    return this.modelValue;
  }

  set model(value) {
    this.$emit('input', this.value);
  }
}
</script>

<style lang="less" scoped>
.radio-button {
  input {
    width: 0.1rem;
    height: 0.1rem;
    border: none;
    clip: rect(0px, 0px, 0px, 0px);
    margin: -0.1rem;
    overflow: hidden;
    padding: 0px;
    position: absolute;
    color: #18181b;

    &:checked + label {
      &::before {
        background-color: #fff;
        border-color: rgb(119, 44, 232);
      }
      &::after {
        background-color: rgb(119, 44, 232);
      }
    }
    &:disabled + label {
      opacity: 0.5;
      pointer-events: none;
    }
  }
  label {
    border-radius: 0.4rem;
    display: block;
    position: relative;
    padding: 0px 0px 0px 1.6rem;
    cursor: pointer;
    user-select: none;
    color: #18181b;
    > * {
      padding-left: 1rem;
    }

    &::before {
      border: solid 2px rgba(0, 0, 0, 0.7);
      position: absolute;
      top: 50%;
      left: 0px;
      width: 1.6rem;
      height: 1.6rem;
      margin-top: -0.8rem;
      box-sizing: border-box;
      background-clip: padding-box;
      content: '';
    }

    &::after {
      display: block;
      content: '';
      position: absolute;
      top: 50%;
      left: 0.4rem;
      width: 0.8rem;
      height: 0.8rem;
      transform: translate3d(0px, -50%, 0px);
    }

    &::before,
    &::after {
      border-radius: 50%;
    }

    &:hover {
      &::before {
        border-color: #000;
      }
    }
  }
}
</style>
