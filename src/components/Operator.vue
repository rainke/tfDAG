<template>
  <g class="operator" v-drag="drag" @mouseup="end">
    <rect :x="x" :y="y" width="100" height="100" opacity="0.45"></rect>
    <rect class="linkdot" :x="x" :y="y+50" width="10" height="10"></rect>
    <rect @mousedown="startDraw($event)" class="linkdot" :x="x+100" :y="y+50" width="10" height="10"></rect>
    <line v-if="isMouseDown" :x1="x+100" :y1="y+50" :x2="drawTo.x" :y2="drawTo.y" stroke="red"></line>
    <line v-for="o in op.next" :key="o.id" :x1="x+100" :y1="y+50" :x2="o.x" :y2="o.y+50" stroke="red"></line>
  </g>
</template>

<script lang="ts">
import {Vue, Component, Emit, Prop} from 'vue-property-decorator';
import {State, Mutation} from 'vuex-class';
import * as d3 from 'd3';
import {Operator as op} from './relation';

@Component
export default class Operator extends Vue {
  @Prop({
    default: new op()
  }) public op!: op;
  @State('currentOperator') public currentOperator!: op;
  public isMouseDown: boolean = false;
  @Mutation('setMouseDown') public setMouseDown!: (down: boolean) => void;
  @Mutation('setCurrOperator') public setCurrOperator!: (op: op) => void;
  @Emit() public startDraw(event: MouseEvent) {
    event.stopImmediatePropagation();
    this.isMouseDown = true;
    this.setCurrOperator(this.op);
    const self = this;
    const view = d3.select(event.view);
    view.on('mousemove.drawLink', function() {
      const svg = d3.select('svg');
      const svgNode = svg.node() as SVGSVGElement;
      const [x, y] = d3.mouse(svgNode);
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
    if (this.currentOperator.next.indexOf(this.op) === -1 && this.currentOperator !== this.op) {
      this.currentOperator.next.push(this.op);
    }
  }

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
