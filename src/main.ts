import Vue from 'vue';
import App from './App.vue';
import store from './store';
import * as d3 from 'd3';

Vue.config.productionTip = false;

Vue.directive('drag', {
  inserted(el, binding) {
    let isMouseDown = false;
    const group = d3.select(el);
    // @ts-ignore
    const svgNode = el.ownerSVGElement;
    const svg = d3.select(svgNode);
    let dx = 0;
    let dy = 0;
    let tx = 0;
    let ty = 0;
    group.on('mousedown', function() {
      isMouseDown = true;
      const [x, y] = d3.mouse(svgNode);
      dx = x;
      dy = y;
      const transform = group.attr('transform');
      if (transform) {
        const match = transform.match(/(\d+)[\s,]+(\d+)/);
        if (match) {
          tx = +match[1];
          ty = +match[2];
        }
      }
    });
    svg.on('mousemove', function() {
      if (isMouseDown) {
        const [x, y] = d3.mouse(svgNode);
        group.attr('transform', `translate(${tx + x - dx} ${ty + y - dy})`);
      }
    }).on('mouseup', function() {
      isMouseDown = false;
    });
  }
});

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
