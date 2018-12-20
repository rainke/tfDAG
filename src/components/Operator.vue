<template>
  <g class="operator" v-drag="drag" @mouseup="end">
    <!-- <g > -->
    <rect class="main-rect" :class="{selected: op.selected}" @click="selectOp($event)" :x="x" :y="y" width="100" height="100" opacity="0.45"></rect>
    <a href="javascript:;" @click="del">
      <circle class="delete" :cx="x+100" :cy="y" r="8" fill="none"></circle>
      <text class="delete" :x="x+100" :y="y+1" fill="none" dominant-baseline="middle" text-anchor="middle">×</text>
    </a>
    <rect class="linkdot" :x="x-5" :y="y+45" width="10" height="10" fill="none"></rect>
    <rect class="linkdot" @mousedown="startDraw($event)" :x="x+95" :y="y+45" width="10" height="10" fill="none"></rect>
    <text v-maxlength="70" class="text-task" :x="x + 10" :y="y+25" :fill="op.task_id ? 'blue': 'red'">任务ID:{{op.task_id}}</text>
    <text class="ghost ghost-task" :x="x + 10" :y="y+25" :fill="op.task_id ? 'blue': 'red'">任务ID:{{op.task_id}}</text>
    <text v-maxlength="70" class="text-source" :x="x + 10" :y="y+50" fill="blue">源ID:{{op.source_id}}</text>
    <text  class="ghost ghost-source" :x="x + 10" :y="y+50" fill="blue">源ID:{{op.source_id}}</text>
    <rect class="detail" @click="openDialog" :x="x+10" :y="y+60" width="80" height="30" rx="5" ry="5"></rect>
    <text class="detail-text" :x="x+50" :y="y+75" fill="black" width="80" height="30" dominant-baseline="middle" text-anchor="middle">详情</text>
    <!-- </g> -->
    <line v-if="isMouseDown" pointer-events="none" :x1="x+100" :y1="y+50" :x2="drawTo.x" :y2="drawTo.y" stroke="red" marker-end="url(#arrow)"></line>
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
import {Vue, Component, Emit, Prop, Inject} from 'vue-property-decorator';
import {State, Mutation} from 'vuex-class';
import {select, mouse} from 'd3-selection';
import {Mode} from '@/model';
import {Operator as op} from './relation';
import Dialog from './Dialog.vue';

function wrap(this: any) {
  const self = select(this);
  let textLength = self.node().getComputedTextLength();
  let text = self.text();
  while (textLength > (80) && text.length > 0) {
    text = text.slice(0, -1);
    self.text(text + '...');
    textLength = self.node().getComputedTextLength();
  }
}

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
  @Inject() private ops!: op[];


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
    if (
      this.currentOperator && // 起点
      this.currentOperator.next.indexOf(this.op) === -1 && // 起点不能已经指向终点
      this.currentOperator !== this.op && // 不能是自身
      this.op.next.indexOf(this.currentOperator) === -1 // 终点不能已经指向起点
    ) {
      this.currentOperator.next.push(this.op);
    }
    this.setCurrOperator(void 0);
  }

  @Emit() private del() {
    // console.log(this.dagops);
    const idx = this.ops.indexOf(this.op);
    this.ops.forEach(({next}) => {
      const i = next.indexOf(this.op);
      if (i >= 0) {
        next.splice(i, 1);
      }
    });
    if (idx >= 0) {
      this.ops.splice(idx, 1);
    }
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
  circle.delete {
    fill: red;
  }
  text.delete {
    fill: #fff;
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

.detail {
  fill:antiquewhite;
  opacity: .5;
  cursor: pointer;
  &:hover {
    opacity: .3;
  }
}

.detail-text {
  // cursor: pointer;
  pointer-events: none;
  // &:hover {
  //   opacity: .7;
  // }
}

text {
  user-select: none;
}

.text-task {
  // pointer-events: hover;
  &:hover {
    fill: transparent;
    & + .ghost-task {
      display: unset;
    }
  }
}
.text-source {
  &:hover {
    fill: transparent;
    & + .ghost-source {
      display: unset;
    }
  }
}
.ghost {
  display: none;
  pointer-events: none;
}
</style>
