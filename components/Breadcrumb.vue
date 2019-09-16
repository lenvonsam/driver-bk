<template lang="pug">
.crm-breadcrumb-container(:class="{'has-bottom-line': hasBottomLine}")
  .crm-breadcrumb
    el-breadcrumb(separator-class="el-icon-arrow-right")
      el-breadcrumb-item(v-for="(item,idx) in breadItems", :key="idx") {{item}}
</template>

<script>
export default {
  props: {
    breadItems: {
      type: Array,
      required: true
    },
    hasBottomLine: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../assets/stylus/color';

.crm-breadcrumb-container {
  padding-bottom: 15px;

  &.has-bottom-line {
    border-bottom: 1px solid $color-border;
  }

  .crm-breadcrumb {
    border-left: 2px solid $color-main;
    padding-left: 10px;
  }
}
</style>
