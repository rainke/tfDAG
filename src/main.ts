import Vue from 'vue';
import App from './App.vue';
import store from './store';
import * as d3 from 'd3';
import { drag } from 'd3';
// @ts-ignore
window.d3 = d3;

Vue.config.productionTip = false;

Vue.directive('drag', {
  inserted(el, binding) {
    let isMouseDown = false;
    const group = d3.select(el);
    // @ts-ignore
    const svgNode = el.ownerSVGElement;
    const svg = d3.select(svgNode);
    // let tx = 0;
    // let ty = 0;
    group.on('mousedown.vdrag', function() {
      isMouseDown = true;
      let [x, y] = d3.mouse(svgNode);
      // const transform = group.attr('transform');
      // if (transform) {
      //   const match = transform.match(/(\d+)[\s,]+(\d+)/); // 会对便宜取整处理，所以此处不考虑小数
      //   if (match) {
      //     tx = +match[1];
      //     ty = +match[2];
      //   }
      // }
      svg.on('mousemove.vdrag', function() {
        if (isMouseDown) {
          const [x2, y2] = d3.mouse(svgNode);
          if (binding.value) {
            binding.value({
              dx: x2 - x,
              dy: y2 - y
            });
          }
          x = x2; y = y2;
          // group.attr('transform', `translate(${Math.floor(tx + x2 - x)} ${Math.floor(ty + y2 - y)})`);
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
