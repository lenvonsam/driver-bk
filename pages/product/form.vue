<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  .mt-25.border.padding.pt-30
    div(style="max-width: 90%; margin: 0 auto;")
      el-form(ref="productForm", :rules="formRules", :model="product")
        el-row
          el-col(:span="12")
            el-form-item(label="商品名称", prop="name")
              el-input(style="max-width: 60%", v-model="product.name")
          el-col(:span="12")
            el-form-item(label="兑换积分", prop="integral")
              el-input-number(style="max-width: 60%", :min="1", :step="1", v-model="product.integral")
        el-row
          el-col(:span="12")
            el-form-item(label="商品图片", prop="img")
              single-pic(v-model="product.img")
          el-col(:span="12")
            el-form-item.mb-5(label="商品说明", required)
            .padding-sm
              el-row
                el-col.pt-5(:span="7")
                  span {{product.integral}}积分兑换一张免费的
                el-col(:span="12")
                  el-input.product-ipt-place(size="mini", v-model="infoFirst")
                el-col.pt-5(:span="5")
                  span.ml-5 券，可用于
              el-row.mt-10
                el-col(:span="14")
                  el-input.product-ipt-place(size="mini", v-model="infoSec")
                el-col.pt-5(:span="10")
                  span.ml-5 抵扣，可到我的卡券查看使用
        el-row
          el-col(:span="12")
            el-form-item(label="开始日期", prop="startDate")
              el-date-picker(v-model="product.startDate", value-format="yyyy-MM-dd HH:mm:ss", format="yyyy-MM-dd")
          el-col(:span="12")
            el-form-item(label="结束日期", prop="endDate")
              el-date-picker(v-model="product.endDate", value-format="yyyy-MM-dd HH:mm:ss", format="yyyy-MM-dd")
        el-row
          el-col(:span="12")
            el-form-item(label="期限说明", prop="dayCount")
              span 领取之日起
              el-input-number.ml-10.mr-10(:min="1", v-model="product.dayCount", controls-position="right", size="mini", style="width: 90px")
              span 天内有效
          el-col(:span="12")
        el-row.mt-10(style="padding-left: 5%")
          el-button(type="primary", @click="formSubmit('productForm')") {{ routeType == 'edit' ? '更新' : '保存' }}
          el-button(@click="back", v-if="routeType.length > 0") 返回
</template>

<script>
import singlePic from '@/components/SinglePicUpload.vue'
export default {
  layout: 'main',
  components: {
    singlePic
  },
  data() {
    return {
      breadItems: ['商品管理', '商品编辑'],
      product: {
        name: '',
        img: '',
        startDate: '',
        endDate: '',
        integral: 1,
        dayCount: 1
      },
      formRules: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        img: [{ required: true, message: '不能为空', trigger: 'blur' }],
        startDate: [{ required: true, message: '不能为空', trigger: 'blur' }],
        endDate: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      // 商品说明第一段
      infoFirst: '',
      // 商品说明第二段
      infoSec: '',
      routeType: ''
    }
  },
  beforeMount() {
    console.log(this.$route)
    this.routeType = this.$route.query.type || ''
    if (this.routeType === 'edit') this.getProductInfo()
  },
  methods: {
    async getProductInfo() {
      try {
        const { data } = await this.apiStreamPost('/proxy/common/get', {
          url: this.apiList.local.product + '/' + this.$route.query.id
        })
        if (data.return_code === 0) {
          this.product = Object.assign({}, data.obj)
          this.product.startDate = new Date(this.product.startDate)
          this.product.endDate = new Date(this.product.endDate)
          console.log('product:>>', this.product)
          this.infoFirst = this.product.info.substring(
            this.product.info.indexOf('积分兑换一张免费的') + 9,
            this.product.info.indexOf('券，')
          )
          this.infoSec = this.product.info.substring(
            this.product.info.indexOf('可用于') + 3,
            this.product.info.indexOf('抵扣，')
          )
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.msgShow(this, e.message || '网络异常')
      }
    },
    formSubmit(formName) {
      if (
        this.infoFirst.trim().length === 0 ||
        this.infoSec.trim().length === 0
      ) {
        this.msgShow(this, '商品说明请补充完整')
        return
      }
      this.formValidate(this, formName)
        .then(res => {
          this.callSumbitApi()
        })
        .catch(e => {
          console.error(e)
        })
    },
    async callSumbitApi() {
      try {
        this.pageShow(this, '处理中..')
        const body = Object.assign({}, this.product)
        let prefix = '/proxy/common/post'
        console.log(typeof body.startDate)
        if (typeof body.startDate === 'object') {
          body.startDate = this.date2Str(body.startDate)
        }
        if (typeof body.endDate === 'object') {
          body.endDate = this.date2Str(body.endDate)
        }
        body.startDate =
          body.startDate.toString().substring(0, 10) + ' 00:00:00'
        body.endDate = body.endDate.toString().substring(0, 10) + ' 23:59:59'
        if (this.routeType === 'edit') {
          prefix = '/proxy/common/put'
          delete body.createAt
          delete body.updateAt
        }
        body.info = `${body.integral}积分兑换一张免费的${this.infoFirst}券，可用于${this.infoSec}抵扣，可到我的卡券查看使用`
        body.rangeInfo = `领取之日起${body.dayCount}天内有效`
        const { data } = await this.apiStreamPost(prefix, {
          url: this.apiList.local.product,
          params: body
        })
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(
            this,
            this.routeType === 'edit' ? '更新成功' : '保存成功',
            'success'
          )
          this.jump('/product/list')
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
