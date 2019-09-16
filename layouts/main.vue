<template lang="pug">
client-only
  .crm.main
    //- .crm-topbar.pl-15
    .crm-topbar
      .item.brand.pl-10.row(@click="jump({path: '/dashboard'})")
        div
          //- img.logo-img(src="../static/logo2.png")
        span.pl-10.ft-16 积分商品系统
      .item
      //- .item.flex-50(@click="jump({path: '/setting/profile'})")
        img.header-img(:src="currentUser.avatar == undefined ? defaultAvatar : currentUser.avatar")
      .item.flex-50.ellps {{currentUser.name}}
      .item.flex-50(@click="exitAction") 退出
    .crm-sidebar
      side-bar
    .crm-content
      router-view
</template>

<script>
import { mapState, mapActions } from 'vuex'
import sideBar from '@/components/SideBar.vue'
export default {
  middleware: 'mainRouteMatch',
  components: {
    sideBar
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  methods: {
    ...mapActions(['exitUser']),
    exitAction() {
      this.confirmDialog(this, '请确定要退出吗?')
        .then(() => {
          this.serverExit()
        })
        .catch(() => {
          console.log('cancel')
        })
    },
    async serverExit() {
      try {
        const { data } = await this.apiStreamPost('/proxy/logout', {})
        console.log('data', data)
        if (data.return_code === 0) {
          this.exitUser()
          this.jump({ path: '/login' })
        } else {
          this.msgShow(this, data.msg)
        }
        // this.jump({ path: '/login' })
      } catch (e) {
        console.error(e)
        this.msgShow(this)
      }
    }
  }
}
</script>

<style lang="stylus">
@import '../assets/stylus/common';

.header-img {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-top: 7px;
}
.logo-img {
  width: 50px;
  padding-top: 16px;
}
.row {
  align-items: center;
}
</style>
