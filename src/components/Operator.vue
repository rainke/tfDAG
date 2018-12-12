<template>
  <g class="operator" v-drag="drag" @mouseup="end">
    <rect class="main-rect" :class="{selected: op.selected}" @dblclick="openDialog" @click="selectOp($event)" :x="x" :y="y" width="100" height="100" opacity="0.45"></rect>
    <rect class="linkdot" :x="x-5" :y="y+45" width="10" height="10" fill="none"></rect>
    <rect class="linkdot" @mousedown="startDraw($event)" :x="x+95" :y="y+45" width="10" height="10" fill="none"></rect>
    <line v-if="isMouseDown" :x1="x+100" :y1="y+50" :x2="drawTo.x" :y2="drawTo.y" stroke="red" marker-end="url(#arrow)"></line>
    <line
      class="linkline"
      v-for="o in op.next"
      :key="o.id"
      @dblclick="removeLinkWith(o)"
      pointer-events="mousedown"
      :x1="x+100"
      :y1="y+50"
      :x2="o.x"
      :y2="o.y+50"
      stroke="red"
      marker-end="url(#arrow)"
    ></line>
  </g>
</template>

<script lang="ts">
import {Vue, Component, Emit, Prop} from 'vue-property-decorator';
import {State, Mutation} from 'vuex-class';
import {select, mouse} from 'd3-selection';
import {Mode} from '@/model';
import {Operator as op} from './relation';
import Dialog from './Dialog.vue';

@Component({
  components: {
    Dialog
  }
})
export default class Operator extends Vue {
  @Prop({
    default: new op()
  }) public op!: op;

  @State('currentOperator') public currentOperator!: op | undefined;
  @State('mode') public mode!: Mode;

  public isMouseDown: boolean = false;

  @Mutation('setMouseDown') public setMouseDown!: (down: boolean) => void;

  @Mutation('setCurrOperator') public setCurrOperator!: (op: op | undefined) => void;

  get x() {
    return this.op.x;
  }

  get y() {
    return this.op.y;
  }

  get drawTo() {
    return this.op.drawTo;
  }

  public drag = (e: {dx: number, dy: number}) => {
    this.op.x += e.dx;
    this.op.y += e.dy;
  }

  @Emit() public startDraw(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.isMouseDown = true;
    this.setCurrOperator(this.op);
    const self = this;
    const view = select(event.view);
    view.on('mousemove.drawLink', function() {
      const svg = select('svg');
      const svgNode = svg.node() as SVGSVGElement;
      const [x, y] = mouse(svgNode);
      if (self.isMouseDown) {
        self.op.drawTo = {x, y};
      }
    }).on('mouseup.drawLink', function() {
      self.isMouseDown = false;
      self.op.drawTo = {x: 0, y: 0};
      view.on('.drawLine', null);
    });
  }

  @Emit() public end(event: MouseEvent) {
    if (this.currentOperator && this.currentOperator.next.indexOf(this.op) === -1 && this.currentOperator !== this.op) {
      this.currentOperator.next.push(this.op);
    }
    this.setCurrOperator(void 0);
  }

  @Emit() private selectOp(e: MouseEvent) {
    if (this.mode === Mode.SELECT) {
      this.op.selected = true;
    }
  }

  @Emit() private removeLinkWith(o: op) {
    const index = this.op.next.indexOf(o);
    this.op.next.splice(index, 1);
  }

  @Emit() private openDialog() {
    this.$emit('open', this.op);
  }
}

</script>

<style lang="less" scoped>
// .main-rect {
//   &:hover ~ .linkdot {
//     fill:chartreuse;
//   }
// }
.operator:hover {
  .linkdot {
    fill: aqua
  }
}
.linkline:hover {
  stroke: aqua;
}

.main-rect {
  &.selected {
    fill: blue;
  }
}
</style>
