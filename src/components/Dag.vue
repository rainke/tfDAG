<template>
  <div id="dag">
    <div class="tool">
      <Button class="sel-mode" :class="{active: mode === 1}" @click="setSelectMode">选择</Button>
      <Button class="esc" @click="noSelect">取消选择</Button>
      <Button class="add-mode" @click="submitResult">提交</Button>
    </div>
    <div class="design">
      <div class="short">
        <div class="source-item" draggable="true" v-for="source in sources" :key="source.source_id"
          @dragover.prevent="handleSourceDragover"
          @dragstart="handleSourceDragstart(source)"
          @dragend="handleSourceDragend($event)"
        >
          {{source.source_id}}
        </div>
      </div>
      <div class="draw">
        <div class="flow">
          <svg
            ref="svg"
            width="1600"
            height="1600"
            :class="{'select-mode': mode === 1}"
            @click="handleSvgClick($event)"
            @dragenter="handleSvgDragenter($event)"
            @dragover="handleSvgDragover($event)"
            @drop="handleDrop($event)"
          >
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="6" refY="3" refX="10" orient="auto">
                <path d="M0,0 L10,3 L0,6 z"></path>
              </marker>
            </defs>
            <g class="main-group">
              <Operator @open="openDialog" v-for="o in ops" :key="o.id" :x="o.x" :op="o" />
            </g>
            <g class="brush-group"></g>
            <g class="link-group"></g>
          </svg>
          <Dialog :visible="dialogVisible" :operator="dialogOperator" @close="closeDialog" @submit="handleSubmit"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import { brush } from 'd3-brush';
import { select, event, mouse } from 'd3-selection';
import {get, post} from '@/utils/ajax';
import { Operator as Op, computeResult, OperatorData } from './relation';
import Operator from './Operator.vue';
import Dialog from './Dialog.vue';
import { Mode } from '@/model';

@Component({
  components: {
    Operator,
    Dialog
  }
})
export default class Dag extends Vue {
  private ops: Op[] = [];
  private drag: boolean = false;
  private dragSource: OperatorData|null = null;
  private dragOperator: Op|null = null;
  private sources: OperatorData[] = [];
  @State('mode') private mode!: Mode;
  @Mutation('setMode') private setMode!: (mode: Mode) => void;
  private dialogVisible = false;
  private dialogOperator: Op | object = {};
  @Emit() public openDialog(op: Op) {
    this.dialogVisible = true;
    this.dialogOperator = op;
  }
  @Emit() public closeDialog() {
    this.dialogVisible = false;
    this.dialogOperator = {};
  }

  @Emit() private handleSubmit() {
    this.dialogVisible = false;
  }

  @Emit() private handleSourceDragover() {}

  @Emit() private handleSourceDragstart(source: OperatorData) {
    this.drag = true;
    this.dragSource = source;
  }
  @Emit() private handleSourceDragend(e: DragEvent) {
    this.drag = false;
    const svgLoc = (this.$refs.svg as Element).getBoundingClientRect();
    if ((e.clientX < svgLoc.left || e.clientY < svgLoc.top) && this.dragOperator) {
      const idx = this.ops.indexOf(this.dragOperator);
      if (idx >= 0) {
        this.ops.splice(idx, 1);
      }
    }
    this.dragSource = null;
    this.dragOperator = null;
  }

  @Emit() private handleSvgDragenter(e: DragEvent) {
    // const svg = (this.$refs.svg as Element).getBoundingClientRect();
    if (!this.dragOperator && this.dragSource) {
      const operator = new Op(e.offsetX, e.offsetY);
      operator.setData(this.dragSource);
      this.dragOperator = operator;
      this.ops.push(operator);
    }
  }

  @Emit() private handleSvgDragover(e: DragEvent) {
    if (this.dragOperator) {
      this.dragOperator.x = e.offsetX;
      this.dragOperator.y = e.offsetY;
    }
  }

  @Emit() private handleDrop(e: DragEvent) {

  }

  @Emit() private noSelect() {
    this.ops.forEach(o => o.selected = false);
    this.setSelectNone();
  }

  @Emit() private setSelectMode() {
    this.setMode(Mode.SELECT);
    select('.overlay').attr('pointer-events', 'all');
    const self = this;
    const brushGroup = select<SVGGElement, {}>('.brush-group');
    const b = brush()
      .on('brush', function() {})
      .on('end', function() {
        if (event.selection) {
          brushGroup.call(b.move, null);
          self.selectOp(event.selection);
        }
      });
    brushGroup.call(b);
  }

  @Emit() private addOpertor() {
    this.setMode(Mode.ADD_OPERATOR);
  }

  @Emit() private submitResult() {
    if (!this.ops.length) {
      return alert('没有operator');
    }
    const data = computeResult(this.ops);
    post('/api/experimental/dags/create_dagfile', data).then(({status, msg}) => {
      if (status === 0) {
        alert('修改成功');
      } else {
        alert(msg);
      }
    });
    // get('/api/experimental/dags/create_dagfile', {params: data}).then(res => {});
  }

  @Emit() private handleSvgClick(e: MouseEvent) {
    if (this.mode === Mode.ADD_OPERATOR) {
      const {offsetX, offsetY} = e;
      this.ops.push(new Op(offsetX, offsetY));
      this.setSelectNone();
    }
  }

  private setSelectNone() {
    this.setMode(Mode.NONE);
    select<SVGGElement, {}>('.brush-group').on('.brush', null);
    select('.overlay').attr('pointer-events', 'none');
  }

  private selectOp(selection: [[number, number], [number, number]]) {
    const svgLoc = (this.$refs.svg as Element).getBoundingClientRect();
    this.ops.forEach(op => {
      const opSelection = [
        [op.x, op.y],
        [op.x + op.width, op.y + op.width]
      ];
      if (
        opSelection[0][0] > selection[0][0] &&
        opSelection[0][1] > selection[0][1] &&
        opSelection[1][0] < selection[1][0] &&
        opSelection[1][1] < selection[1][1]
      ) {
        op.selected = true;
      } else {
        op.selected = false;
      }
    });
  }

  private mounted() {
    window.addEventListener('keyup', this.handleKeyUp);
    get('/api/experimental/tasksources').then(res => {
      // let index = 0;
      for (const [key, value] of Object.entries(res)) {
        // const x = index * 200;
        // index++;
        // const operator = new Op(x);
        // operator.setData(value as OperatorData);
        // this.ops.push(operator);
        this.sources.push(value as OperatorData);
      }
    });
  }

  private destoryed() {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.ops = this.ops.filter(op => !op.selected);
    } else if (e.key === 'Escape') {
      this.noSelect();
      this.setSelectNone();
    }
  }

}

</script>

<style lang="less" scoped>
@import '~@/style/variable.less';

#dag {
  height: 100%;
  display: flex;
  flex-direction: column;
  .tool {
    height: 50px;
    background-color: aliceblue;
  }
  .design {
    display: flex;
    flex: 1;
    overflow: hidden;
    .short {
      width: 120px;
      background-color: beige;
      .sel-mode.active {
        box-shadow: inset 0 0 2px 2px #666;
      }
      .source-item {
        line-height: 30px;
        background: #666;
        color: #fff;
        cursor: move;
        border-bottom: 1px solid pink;
      }
    }
    .draw {
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: lightblue;
      }
  
      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: grey;
      }
  
      &::-webkit-scrollbar-button {
        width: 0;
        height: 0;
      }
  
      &::-webkit-scrollbar-track {
        border-radius: 4px;
      }
      flex: 1;
      overflow: scroll;

      .flow {
        width: 2000px;
        height: 2000px;
        background-color:@dga-marginclolr;
        display: flex;
        svg {
          background: #fff;
          background-image: 
            repeating-linear-gradient(@dga-gridcolor, @dga-gridcolor 1%, transparent 0,  transparent 20%),
            linear-gradient(transparent 99%, @dga-gridcolor 0),
            repeating-linear-gradient(to right, @dga-gridcolor, @dga-gridcolor 1%, transparent 0,  transparent 20%),
            linear-gradient(to right, transparent 99%, @dga-gridcolor 0);
          background-size: 100px 100px;
          margin: 40px 0 0 40px;
          &.select-mode {
            cursor: crosshair;
          }
        }
      }
    }
  }
}
</style>
