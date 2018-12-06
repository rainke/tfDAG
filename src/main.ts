import Vue from 'vue';
import App from './App.vue';
import store from './store';
import {select, mouse, event} from 'd3-selection';

Vue.config.productionTip = false;

Vue.directive('drag', {
  inserted(el, binding) {
    let isMouseDown = false;
    const group = select(el);
    // @ts-ignore
    const svgNode = el.ownerSVGElement;
    const svg = select(svgNode);
    group.on('mousedown.vdrag', function() {
      isMouseDown = true;
      let [x, y] = mouse(svgNode);
      svg.on('mousemove.vdrag', function() {
        if (isMouseDown) {
          const [x2, y2] = mouse(svgNode);
          if (binding.value) {
            binding.value({
              dx: x2 - x,
              dy: y2 - y
            });
          }
          x = x2; y = y2;
        }
      }).on('mouseup.vdrag', function() {
        isMouseDown = false;
        svg.on('mousemove.vdrag mouseup.vdrag', null);
      });
    });
  }
});

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
