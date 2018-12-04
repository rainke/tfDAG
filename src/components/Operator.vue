<template>
  <g class="operator" v-drag>
    <rect x="0" y="0" width="100" height="100" opacity="0.45"></rect>
    <rect class="linkdot" x="0" y="50" width="10" height="10"></rect>
    <rect @mousedown="startDraw($event)" class="linkdot" x="100" y="50" width="10" height="10"></rect>
  </g>
</template>

<script lang="ts">
import {Vue, Component, Emit} from 'vue-property-decorator';
import {State, Mutation} from 'vuex-class';

@Component
export default class Operator extends Vue {
  @State('isMouseDown') public isMouseDown!: boolean;
  @Mutation('setMouseDown') public setMouseDown!: (down: boolean) => void;
  @Emit() public startDraw(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.setMouseDown(true);
  }
}

</script>

<style lang="less" scoped>
.operator {
  &:hover {
    .linkdot {
      fill:chartreuse;
    }
  }
}
</style>
