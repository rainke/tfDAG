<template>
  <div id="main_content">
    <Dag />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Dag from './components/Dag.vue';

@Component({
  components: {
    Dag
  }
})
export default class App extends Vue {}
</script>

<style lang="less">
html, body  {
  margin: 0;
  height: 100%;
}
#main_content {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .overlay {
    cursor: unset;
  }
  .node {
    &:hover {
      .linkpoint {
        fill:aqua;
      }
    }
  }
}
</style>
