<template lang="pug">
el-menu(background-color="#42485b", text-color="#fff", active-text-color="#fff", router, default-active="/product/list", :unique-opened="true")
  template(v-for="(menu,idx) in currentMenus")
    template(v-if="menu.subItems")
      el-submenu(:index="menu.title")
        template(slot="title")
          i(v-if="menu.iconClass", :class="menu.iconClass")
          span {{menu.title}}
          //- :index="(idx + 1) + '-' + (subIdx + 1)"
        el-menu-item(:index="itm.url", :route="itm.url ? itm.url : '#'", v-for="(itm, subIdx) in menu.subItems", :key="subIdx") {{itm.title}}
    el-menu-item(:index="menu.title", :route="menu.url ? menu.url : '#'", v-else) {{menu.title}}
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      currentMenus: state => state.currentMenus
    })
  }
}
</script>
