<template>
  <div id="dag">
    <div class="tool"></div>
    <div class="design">
      <div class="short"></div>
      <div class="draw" ref="draw">
        <div class="flow">
          <svg width="1600" height="1600">
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
          <Dialog :visible="dialogVisible" @close="closeDialog"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Emit} from 'vue-property-decorator';
import {
  State,
  Mutation
} from 'vuex-class';
import Operator from './Operator.vue';
import Dialog from './Dialog.vue';
import {Operator as op} from './relation';

@Component({
  components: {
    Operator,
    Dialog
  }
})
export default class Dag extends Vue {
  public ops: op[] = [new op(), new op(300)];
  @State('isMouseDown') public isMouseDown!: boolean;
  @Mutation('setMouseDown') public setMouseDown!: (down: boolean) => void;
  public dialogVisible = false;
  @Emit() public openDialog() {
    this.dialogVisible = true;
  }
  @Emit() public closeDialog() {
    this.dialogVisible = false;
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
        }
      }
    }
  }
}
</style>
