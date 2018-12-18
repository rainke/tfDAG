<template>
  <div class="dag-list">

  </div>
</template>

<script lang="ts">
import {Vue, Component, Emit, Prop} from 'vue-property-decorator';
import {get, post} from '@/utils/ajax';

@Component
export default class Operator extends Vue {
  @Emit() private mounted() {

  }
}

</script>

<style lang="less" scoped>

</style>
