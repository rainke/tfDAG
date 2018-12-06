<template>
  <transition name="slide-outer">
    <div class="dialog-container" v-show="visible">
      <transition name="slide-fade">
        <div class="dialog-content" v-show="visible">
          <header>hello</header>
          <div class="dialog-body"></div>
          <footer>
              <button>确认</button>
              <button @click="close">取消</button>
          </footer>
        </div>
      </transition>
    </div>
  </transition>
</template>
<script lang="ts">
import {Vue, Component, Emit, Prop, Watch} from 'vue-property-decorator';

@Component
export default class Dialog extends Vue {
  @Prop({default: false}) public readonly visible!: boolean;

  @Emit() private close() {
    this.$emit('close');
  }

  @Watch('visible') private onVisibleChange(v: boolean, ov: boolean) {
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
  .slide-outer-enter-active {
    transition: all .2s ease;
  }
  .slide-outer-leave-active {
    transition: all .3s ease;
  }
  .slide-outer-enter, .slide-outer-leave-to {
    opacity: 0;
  }
  .slide-fade-enter-active, .slide-fade-leave-active{
    transition: all .3s ease;
  }
  .slide-fade-enter-active {
    transition-delay: .2s;
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(-50%);
    opacity: 0;
  }
  .dialog-container {
    // display: flex;
    // justify-content: center;
    // align-items: center;
    background: rgba(0, 0, 0, .5);
    height: 100%;
    position: fixed;
    z-index: 300;
    left: 0;
    right: 0;
    top: 0;
    // pointer-events: none;
    .dialog-content {
      background-color: #ffffff;
      border: 1px solid #999999;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);
      outline: 0;
      margin: 15px auto;
      max-width: 600px;
      width: 100%;
      header {
        padding: 15px;
        border-bottom: 1px solid #e5e5e5;
        min-height: 16.428571429px;
      }
      .dialog-body {
        padding: 15px;
      }
      footer {
        padding: 15px;
        text-align: right;
        border-top: 1px solid #e5e5e5;
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
      }
    }
  }
</style>
