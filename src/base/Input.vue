<template lang="html">
  <span class="input">
    <input
      :value="value"
      v-on:input="$emit('input', $event.target.value)"
    >
  </span>
</template>
<script lang="ts">
import {Vue, Component, Emit, Prop, Watch} from 'vue-property-decorator';

@Component
export default class Input extends Vue {
  @Prop() private value!: string;
}
</script>

<style lang="less" scoped>
  .input {
    display: inline-block;
    width: 250px;
    input {
      -webkit-appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      font-size: inherit;
      height: 30px;
      line-height: 30px;
      outline: none;
      padding: 0 5px;
      transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      width: 100%;
    }
  }
</style>

