import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isMouseDown: false
  },
  mutations: {
    setMouseDown(state, value) {
      state.isMouseDown = value;
    }
  },
  actions: {

  },
});
