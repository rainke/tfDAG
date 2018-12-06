import Vue from 'vue';
import Vuex from 'vuex';
import {Operator} from './components/relation';
import {Mode} from '@/model';

Vue.use(Vuex);

type OorU = Operator | undefined;

export default new Vuex.Store({
  state: {
    isMouseDown: false,
    currentOperator: undefined as OorU,
    mode: Mode.NONE
  },
  mutations: {
    setMouseDown(state, value) {
      state.isMouseDown = value;
    },
    setMode(state, mode: Mode) {
      state.mode = mode;
    },
    setCurrOperator(state, value: OorU) {
      state. currentOperator = value;
    }
  },
  actions: {

  },
});
