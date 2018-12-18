import Vue from 'vue';
import App from './App.vue';
import store from './store';
import {select, mouse} from 'd3-selection';
// import Input from './base/Input.vue';
// import Button from './base/Button.vue';
import { Button, Input, ColorPicker, Message, Select, Option } from 'element-ui';
import './directives/maxlength';

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


Vue.component(Input.name, Input);
Vue.component(Button.name, Button);
Vue.component(ColorPicker.name, ColorPicker);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.prototype.$message = Message;

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#main_content');
