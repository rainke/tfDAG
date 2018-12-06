<template>
  <!-- <transition> -->
    <div class="dialog-container" v-show="visible">
      <div class="dialog-content">
        <h1>I am dialog</h1>
        <button>确认</button>
        <button @click="close">取消</button>
      </div>
    </div>
  <!-- </transition> -->
</template>
<script lang="ts">
import {Vue, Component, Emit, Prop} from 'vue-property-decorator';

@Component
export default class Dialog extends Vue {
  @Prop({default: false}) public readonly visible!: boolean;

  @Emit() private close() {
    this.$emit('close');
  }
  private mounted() {
    document.body.appendChild(this.$el);
  }

  private destoryed() {
    if (this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  }
}

</script>

<style lang="less" scoped>
  .dialog-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: fixed;
    z-index: 300;
    left: 0;
    right: 0;
    top: 0;
    // pointer-events: none;
  }
</style>
