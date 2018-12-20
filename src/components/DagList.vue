<template>
  <div class="dag-list" @click="handleClick($event)">
    <div class="dag-item" v-for="(dag, index) of dagList" :key="dag.dag_args.dag_id" :data-index="index">
      {{dag.dag_args.dag_id}}
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Emit, Prop} from 'vue-property-decorator';
import {getDags} from '@/api';

@Component
export default class Operator extends Vue {
  private dagList: any[] = [];

  public async getDags() {
    const dags = await getDags();
    this.dagList = dags;
  }
  @Emit() private mounted() {
    this.getDags();
  }
  @Emit() private handleClick(e: MouseEvent) {
    const target = e.target as HTMLDivElement;
    const index = Number(target.dataset.index);
    this.$emit('select-dag', this.dagList[index]);
  }
}

</script>

<style lang="less" scoped>
  .dag-list {
    text-align: left;
    line-height: 30px;
    .dag-item {
      border-top: 1px solid #ddd;
      cursor: pointer;
      background-color:antiquewhite;
      &:last-child {
        border-bottom: 1px solid #ddd;
      }
      &:hover {
        opacity: .7;
      }
    }
  }
</style>
