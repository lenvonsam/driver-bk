<template lang="pug">
  .star
    .padding.bg-white
      div.ft-16
        span.ft-bold 库管员：
        span {{manager}}
      div.ft-16.mt-10
        span.ft-bold 主营：
        span {{products}}
    .padding.bg-white.border-bottom-line.mt-10
      .ft-18.ft-bold.mb-20 欢迎对本库区进行评价
      .flex.flex-center
        .text-right.ft-16(style="width:150px;")
          span 车辆出入库组织：
        .height
          el-rate(v-model="starOutIn" show-score score-template="{value}" allow-half text-color="#FF5809")
      .mt-20.flex.flex-center
        .text-right(style="width:150px;")
          span.ft-16 装卸货效率：
        .height
          el-rate(v-model="starSpeed" show-score score-template="{value}" allow-half text-color="#FF5809")
      .mt-20.flex.flex-center
        .text-right(style="width:150px;")
          span.ft-16 库区服务态度：
        .height
          el-rate(v-model="starService" show-score score-template="{value}" allow-half text-color="#FF5809")
      .mt-20.flex.flex-center
        .text-right(style="width:150px;")
          span.ft-16 库区费用收取：
        .height
          el-rate(v-model="starFee" show-score score-template="{value}" allow-half text-color="#FF5809")
      .mt-20.flex.flex-center.height.mb-10
        .text-right(style="width:150px;")
          span.ft-16 人员积极性：
        .height
          el-rate(v-model="starPositive" show-score score-template="{value}" allow-half text-color="#FF5809")
    .padding.bg-white.text-right
      span.ft-18 综合评分：
      span.ft-24.ft-bold.text-orange {{averageScore}}分

    .flex.flex-content-center.mt-30
      el-button(type="primary", style="width: 80%", round, @click="submit", :disabled="!userAuth") 提交评价
    .flex.flex-content-center.mt-20(v-if="!userAuth")
      el-button(type="danger", style="width: 80%", round, @click="submit") 微信授权

</template>

<script>
export default {
  head() {
    return {
      title: this.warehouseName + '门评价'
    }
  },
  data() {
    return {
      id: '',
      warehouseName: '',
      manager: '',
      products: '',
      starOutIn: 0,
      starSpeed: 0,
      starService: 0,
      starFee: 0,
      starPositive: 0,
      appId: 'wxb1a990032d59f1d4',
      userAuth: false,
      wxObj: {}
    }
  },
  computed: {
    averageScore: function() {
      return (
        (this.starOutIn +
          this.starSpeed +
          this.starService +
          this.starFee +
          this.starPositive) /
        5
      )
    }
  },
  beforeMount() {
    console.log(window.location.href, this.$route.query.id)
    this.getWarehouseInfo()

    this.wxObj = JSON.parse(localStorage.getItem('wxUser') || '{}')
    this.userAuth = !!this.wxObj.openId

    // 根据code请求接口，获取用户信息
    const code = this.getQueryString('code')
    if (code) {
      this.getWxUserInfo(code)
    }

    // 判断是否登陆并防止多次执行
    if (!code && !localStorage.getItem('wxUser')) {
      const wxUrl = window.location.href.split('#')[0]
      const pageUrl = encodeURIComponent(wxUrl)
      window.location.href =
        'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
        this.appId +
        '&redirect_uri=' +
        pageUrl +
        '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
    }
  },
  methods: {
    getQueryString(name) {
      const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      const r = window.location.search.substr(1).match(reg)
      if (r != null) return unescape(r[2])
      return null
    },
    async getWxUserInfo(code) {
      try {
        const { data } = await this.apiStreamPost('/proxy/common/post', {
          url: 'http://scp-dev.xingyun361.com/api/wechat/auth/oauth',
          code: code,
          appKey: 'xingYun'
        })
        alert('data:>>', data)
        this.wxObj = data.obj
        localStorage.setItem('wxUser', JSON.stringify(this.wxObj))
        this.userAuth = true
      } catch (e) {
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async getWarehouseInfo() {
      try {
        const { data } = await this.apiStreamPost('/proxy/common/get', {
          url: this.apiList.local.comment + this.$route.query.id
        })
        if (data.return_code === 0) {
          console.log(data)
          this.warehouseName = data.obj.areaName
          this.manager = data.obj.areaLeader + '/' + data.obj.leaderPhone
          this.products = data.obj.mainProduct
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async submit() {
      try {
        this.pageShow(this, '处理中..')
        // const body = Object.assign({}, this.warehouse)
        const params = {
          id: 1,
          nickName: this.wxObj.nickname,
          openId: this.wxObj.openId,
          cid: this.$route.query.id,
          starOutIn: this.starOutIn,
          starSpeed: this.starSpeed,
          starService: this.starService,
          starFee: this.starFee,
          starPositive: this.starPositive
        }
        const { data } = await this.apiStreamPost('/proxy/common/post', {
          url: this.apiList.local.driverComment,
          params: params
        })
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(this, '提交成功', 'success')
          this.jump('/appraise/list')
        } else {
          this.msgShow(this, data.errMsg)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.star
  height 100vh
  width 100vw
  background-color #f4f4f4
  .height
    height 24px
  /deep/ .el-rate__icon
    font-size 24px
  /deep/ .el-rate__text
    font-size 22px
    margin-left 10px
  .text-orange
    color #FF5809
</style>
