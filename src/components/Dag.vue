<template>
  <div id="dag">
    <div class="tool">
      <ElButton :type="mode===1 ? 'primary': ''" :class="{active: mode === 1}" @click="setSelectMode">选择</ElButton>
      <ElButton class="esc" @click="noSelect">取消选择</ElButton>
      <ElButton class="add-mode" @click="submitResult">提交</ElButton>
    </div>
    <div class="design">
      <div class="short">
        <div class="task-sources">
          <div>tasksources</div>
          <div class="source-item" draggable="true" v-for="source in sources" :key="source.source_id"
            @dragover.prevent="handleSourceDragover"
            @dragstart="handleSourceDragstart(source)"
            @dragend="handleSourceDragend($event)"
          >
            <span>{{source.source_id}}</span>
            <a href="javascript:;" @click="delTaskSource(source.source_id)">x</a>
          </div>
          <div class="add-operator">
            <ElButton size="small" @click="openAddDialog">添加</ElButton>
          </div>
        </div>
        <div class="dag-list-container">
          <DagList />
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
              <clipPath id="round-corner">
                <rect x="0" y="0" width="80" height="30" rx="5" ry="5"/>
              </clipPath>
            </defs>
            <g class="main-group">
              <Operator @open="openDialog" v-for="o in ops" :key="o.id" :x="o.x" :op="o" />
            </g>
            <g class="brush-group"></g>
            <g class="link-group"></g>
          </svg>
          <Dialog :visible="dialogVisible" :title="dialogOperator ? dialogOperator.task_id: ''" @close="closeDialog" @submit="handleSubmit">
            <div v-if="dialogOperator">
              <div class="form-group">
                <label class="form-label">task_id: </label>
                <div>
                  <div>
                    <ElInput v-model="dialogOperator.task_id" @input="checkValid"/>
                  </div>
                  <div class="error-message">{{errorMessage}}</div>
                </div>
              </div>
              <div class="form-group">
                <span class="form-label">operator: </span>
                <span class="form-value">{{dialogOperator.operator}}</span>
              </div>
              <div class="form-group" v-for="(value, key) in dialogOperator.params" :key="key">
                <span class="form-label">{{key}}: </span>
                <span class="form-value">{{value}}</span>
              </div>
            </div>
          </Dialog>
          <Dialog :visible.sync="addVisible" title="添加TaskSource" @close="closeAddDialog" @submit="addTasksource">
            <form name="addform" v-if="willBeAddTaskSource">
              <div class="form-group">
                <label class="form-label">source_id: </label>
                <div>
                  <div>
                    <ElInput v-model="willBeAddTaskSource.source_id" />
                  </div>
                </div>
              </div>
              <div class="form-group">
                <span class="form-label">operator: </span>
                <div>
                  <div>
                    <ElSelect v-model="willBeAddTaskSource.op_type" >
                      <el-option
                        v-for="item in globalConfig"
                        :key="item.op_type"
                        :label="item.op_type"
                        :value="item.op_type">
                      </el-option>
                    </ElSelect>
                  </div>
                </div>
              </div>
              <div v-for="p in addParams" :key="p">
                <div class="form-group">
                  <span class="form-label">{{p}}: </span>
                  <div>
                    <div>
                      <ElInput v-model="willBeAddTaskSource[p]" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Dialog>
        </div>
      </div>
      <div class="dag-info">
        <div class="toggle-show">
          <a href="javascript:;" @click="hideDagInfo=!hideDagInfo">{{hideDagInfo ? '&lt;' : '&gt;'}}</a>
        </div>
        <div class="info" v-if="!hideDagInfo">
          <label for="">owner:</label>
          <div><input type="text" v-model="dagInfo.default_args.owner"></div>
          <label for="">dag_id:</label>
          <div><input type="text" v-model="dagInfo.dag_id"></div>
          <label for="">开始日期: {{dagInfo.start_date}}</label>
          <div><input type="datetime-local" v-model="dagInfo.start_date"></div>
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
import { delTaskSource } from '@/api';
import { Operator as Op, computeResult, OperatorData } from './relation';
import Operator from './Operator.vue';
import DagList from './DagList.vue';
import Dialog from './Dialog.vue';
import { Mode } from '@/model';


@Component({
  components: {
    Operator,
    Dialog,
    DagList
  }
})
export default class Dag extends Vue {
  private ops: Op[] = [];
  private drag: boolean = false;
  private dragSource: OperatorData|null = null;
  private dragOperator: Op|null = null;
  private sources: OperatorData[] = [];
  private dialogVisible = false;
  private dialogOperator: Op|null = null;
  private errorMessage: string = '';
  private addVisible = false;
  private willBeAddTaskSource: any = null;
  private globalConfig = globalConfig;
  private dagInfo = {
    dag_id: '',
    default_args: {
      owner: ''
    },
    start_date: ''
  };
  private hideDagInfo = false;
  @State('mode') private mode!: Mode;
  @Mutation('setMode') private setMode!: (mode: Mode) => void;

  get addParams() {
    if (this.willBeAddTaskSource) {
      const f = this.globalConfig.filter((o: any) => o.op_type === this.willBeAddTaskSource.op_type);
      if (f.length) {
        return f[0].op_parmas || f[0].op_params;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  @Emit() private openDialog(op: Op) {
    this.dialogVisible = true;
    this.dialogOperator = op;
  }
  @Emit() private closeDialog() {
    this.dialogVisible = false;
    this.dialogOperator = null;
  }

  @Emit() private checkValid() {
    if (this.dialogOperator) {
      if (!this.dialogOperator.task_id) {
        this.errorMessage = 'task_id不能为空';
      } else {
        if (!this.dialogOperator.task_id.match(/^[a-zA-z][\w\.]*$/)) {
          this.errorMessage = '非法task_id';
        } else {
          this.errorMessage = '';
        }
      }
    }
  }

  @Emit() private handleSubmit() {
    if (!this.errorMessage) {
      this.dialogVisible = false;
    }
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
    this.dragOperator && this.openDialog(this.dragOperator);
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

  @Emit() private handleDrop(e: DragEvent) {}

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

  @Emit() private openAddDialog() {
    // this.setMode(Mode.ADD_OPERATOR);
    this.willBeAddTaskSource = {};
    this.addVisible = true;
  }

  @Emit() private closeAddDialog() {
    this.willBeAddTaskSource = null;
    this.addVisible = false;
  }
  @Emit() private addTasksource() {
    if (!this.willBeAddTaskSource.source_id || !this.willBeAddTaskSource.op_type) {
      this.$message.error('请填写id或operator');
      return;
    }
    const data = {
      op_type: this.willBeAddTaskSource.op_type,
      source_id: this.willBeAddTaskSource.source_id,
      operator_path: '',
      operator_params: {} as any
    };
    const paramsObj = {} as any;
    const config = this.globalConfig.find(item => item.op_type === data.op_type);
    if (config) {
      data.operator_path = config.op_path;
      const params = config.op_params || config.op_parmas;
      for (const param of params as any) {
        paramsObj[param] = this.willBeAddTaskSource[param];
        if (!paramsObj[param]) {
          this.$message('请填写' + param);
          return;
        }
      }
      // params && params.forEach(param => {
      //   paramsObj[param] = this.willBeAddTaskSource[param];
      // });
      data.operator_params = paramsObj;
    }
    post('/api/experimental/tasksources/create', data).then((res: any) => {
      if (res.status === 0) {
        this.closeAddDialog();
        this.getTaskSource();
      } else {
        this.$message(res.msg);
      }
    }, (error: any) => {
      // this.$message(error);
    });
  }

  @Emit() private submitResult() {
    this.hideDagInfo = false;
    if (!this.ops.length) {
      return this.$message('没有operator');
    }
    if (this.ops.some(op => !op.task_id)) {
      return this.$message('请填写任务id');
    }
    const taskIds = this.ops.map(op => op.task_id);
    if (new Set(taskIds).size !== taskIds.length) {
        return this.$message('任务id不能重复');
    }
    if (!this.dagInfo.dag_id) {
      return this.$message('请填写dag_id');
    }
    if (!this.dagInfo.default_args.owner) {
      return this.$message('请填写owner');
    }
    if (!this.dagInfo.start_date) {
      return this.$message('请填写开始时间');
    }

    const data = computeResult(this.ops, this.dagInfo);
    post('/api/experimental/dags/create_dagfile', data).then(({status, msg}) => {
      if (status === 0) {
        alert('修改成功');
      } else {
        alert(msg);
      }
    });
    // get('/api/experimental/dags/create_dagfile', {params: data}).then(res => {});
  }

  @Emit() private delTaskSource(id: string)  {
    this.$confirm('是否删除该task_source?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      delTaskSource(id).then(({status, msg}) => {
        if (status === 0) {
          this.$message.success('删除成功');
          this.getTaskSource();
        } else {
          this.$message.warning('msg');
        }
      });
    });
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
    this.getTaskSource();
  }

  private getTaskSource() {
    get('/api/experimental/tasksources').then(res => {
      const sources = [];
      for (const [key, value] of Object.entries(res)) {
        sources.push(value as OperatorData);
      }
      this.sources = sources;
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
    position: relative;
    flex: 1;
    // overflow: hidden;
    .short {
      @short-width: 130px;
      width: @short-width;
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
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        span {
          width: @short-width * 0.9;
        }
        a {
          width: @short-width * 0.1;
          background: #c00;
          color: #fff;
          text-decoration: none;
          &:hover {
            background-color: #e00;
          }
        }
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
    .dag-info {
      
      padding: 10px 0;
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      .toggle-show {
        width: 20px;
        a {
          background: #666;
          text-decoration: none;
          display: block;
          line-height: 30px;
          color:#eee;
        }
      }
      .info {
        text-align: left;
        padding: 10px;
        flex:1;
        background: #fff;
        box-shadow: 2px 3px 3px 0px #666;
      }
    }
  }
}
.dialog-content {
  .dialog-body {
    .form-group {
      display: flex;
      margin: 10px 20px;
      .form-label,.form-value {
        width: 120px;
        text-align: right;
        padding: 0 10px;
        line-height: 30px;
        color: #666;
      }
      .form-value {
        text-align: left;
        color: #333;
        width: 300px;
        word-break: break-all;
      }
      .error-message {
        color: red;
        margin-top: 5px;
      }
    }
  }
}
</style>
