// import 'whatwg-fetch';
// import 'url-search-params-polyfill';
import Vue from 'vue';
import App from './App.vue';
import store from './store';

import {
  Button,
  Input,
  ColorPicker,
  Message,
  Select,
  Option,
  MessageBox,
  Notification
} from 'element-ui';
import './directives';

Vue.config.productionTip = false;
Vue.component(Input.name, Input);
Vue.component(Button.name, Button);
Vue.component(ColorPicker.name, ColorPicker);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$notify = Notification;

new Vue({
  store,
  render: h => h(App)
}).$mount('#main_content');
