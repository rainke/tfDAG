<template>
  <transition name="slide-outer">
    <div class="dialog-container" v-show="visible">
      <transition name="slide-fade">
        <div class="dialog-content" v-show="visible">
          <header>hello</header>
          <div class="dialog-body">
            <div v-if="operator">
              <div class="form-group">
                <label class="form-label">task_id: </label>
                <div>
                  <div>
                    <Input v-model="operator.task_id" @input="checkValid"/>
                  </div>
                  <div class="error-message">{{errorMessage}}</div>
                </div>
              </div>
              <div class="form-group">
                <span class="form-label">operator: </span>
                <span class="form-value">{{operator.operator}}</span>
              </div>
              <div class="form-group">
                <span class="form-label">method: </span>
                <span class="form-value" v-if="operator.params">{{operator.params.method}}</span>
              </div>
              <div class="form-group">
                <span class="form-label">path: </span>
                <span class="form-value" v-if="operator.params">{{operator.params.path}}</span>
              </div>
              <div class="form-group">
                <span class="form-label">token: </span>
                <span class="form-value" v-if="operator.params">{{operator.params.token}}</span>
              </div>
            </div>
          </div>
          <footer>
              <button @click="handleSubmit">确认</button>
              <button @click="close">取消</button>
          </footer>
        </div>
      </transition>
    </div>
  </transition>
</template>
<script lang="ts">
import {Vue, Component, Emit, Prop, Watch} from 'vue-property-decorator';
import { Operator } from '@/components/relation';

@Component
export default class Dialog extends Vue {
  @Prop({default: false}) public readonly visible!: boolean;
  @Prop() public operator!: Operator;
  private errorMessage: string = '';

  @Emit() private close() {
    this.$emit('close');
  }

  @Emit() private handleSubmit() {
    if (!this.errorMessage) {
      this.$emit('submit');
    }
  }

  @Emit() private checkValid() {
    if (!this.operator.task_id) {
      this.errorMessage = 'task_id不能为空';
    } else {
      if (!this.operator.task_id.match(/^[a-zA-z][\w\.]*$/)) {
        this.errorMessage = '非法task_id';
      } else {
        this.errorMessage = '';
      }
    }
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
