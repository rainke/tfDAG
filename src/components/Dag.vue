<template>
  <div id="dag">
    <div class="tool"></div>
    <div class="design">
      <div class="short">
        <button class="sel-mode" :class="{active: mode === 1}" @click="setSelectMode">选择</button> <br>
        <button class="esc" @click="noSelect">取消选择</button><br>
        <button class="add-mode" @click="addOpertor">添加Operator</button><br>
        <button class="add-mode" @click="submitResult">提交</button><br>
      </div>
      <div class="draw">
        <div class="flow">
          <svg
            ref="svg"
            width="1600"
            height="1600"
            :class="{'select-mode': mode === 1}"
            @click="handleSvgClick($event)"
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
import { Operator as Op, computeResult } from './relation';
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
  public ops: Op[] = [];
  @State('mode') public mode!: Mode;
  @Mutation('setMode') public setMode!: (mode: Mode) => void;
  public dialogVisible = false;
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
    post('/api/add_operator', {});
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
    const data = computeResult(this.ops);
    post('/api/change_dag', data).then(res => {});
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
      // console.log(res);
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
    height: 30px;
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
