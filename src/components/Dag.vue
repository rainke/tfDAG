<template>
  <div id="dag">
    <div class="tool"></div>
    <div class="design">
      <div class="short"></div>
      <div class="draw" ref="draw">
        <div class="flow">
          <svg width="1600" height="1600"></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Emit} from 'vue-property-decorator';

@Component({
  components: {}
})
export default class Dag extends Vue {
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
