<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';

@Component
export default class VButton extends Vue {
  @Emit() private handleClick(evt: MouseEvent) {
    this.$emit('click', evt);
  }
}
</script>

<style lang="less" scoped>
  button {
    margin-bottom: 0;
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
    touch-action: manipulation;
    cursor: pointer;
    border: 1px solid #0073e8;
    white-space: nowrap;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.428571429;
    border-radius: 4px;
    user-select: none;
    margin-right: 4px;
    background: #0073e8;
    color: #fff;
    &:active {
      box-shadow: inset 0 6px 6px rgba(0, 0, 0, 0.4);
      outline: none;
    }
  }
</style>

