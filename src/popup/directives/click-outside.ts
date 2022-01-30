import { DirectiveOptions } from 'vue';

interface AugmentedHTMLElement extends HTMLElement {
  clickOutsideEvent?: (this: HTMLElement, event: MouseEvent) => void;
}

export const ClickOutside: DirectiveOptions = {
  bind: (el: AugmentedHTMLElement, binding) => {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unbind: (el: AugmentedHTMLElement) => {
    document.body.removeEventListener('click', el.clickOutsideEvent!);
  },
};
