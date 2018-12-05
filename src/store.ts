import Vue from 'vue';
import Vuex from 'vuex';
import {Operator} from './components/relation';

Vue.use(Vuex);

type OorU = Operator | undefined;

export default new Vuex.Store({
  state: {
    isMouseDown: false,
    currentOperator: undefined as OorU
  },
  mutations: {
    setMouseDown(state, value) {
      state.isMouseDown = value;
    },
    setCurrOperator(state, value: OorU) {
      state. currentOperator = value;
    }
  },
  actions: {

  },
});
