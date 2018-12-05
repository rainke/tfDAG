<template>
    <div class="dialog-container"></div>
</template>
<script lang="ts">
import {Vue, Component, Emit, Prop} from 'vue-property-decorator';

@Component
export default class Dialog extends Vue {

}

</script>

<style lang="less" scoped>
    .dialog-container {
        display: flex;
        height: 100%;
        position: fixed;
    }
</style>
