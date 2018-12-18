import Vue from 'vue';

Vue.directive('maxlength', {
  inserted(el, binding) {},
  update(el, binding) {
    let text = el.textContent || '';
    const maxLen = binding.value || 80;
    // @ts-ignore
    let textLength = el.getComputedTextLength();
    if (textLength <= maxLen) {
      return;
    }
    while (textLength > maxLen) {
      text = text.slice(0, -1);
      el.innerHTML = text;
      // @ts-ignore
      textLength = el.getComputedTextLength();
    }
    el.innerHTML = text + '...';
  }
});
