<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  .mt-25.border.padding.pt-30
    div(style="max-width: 90%; margin: 0 auto;")
      el-form(ref="warehouseForm", :rules="formRules", :model="warehouse", label-width="100px", label-position="left")
        el-row
          el-col(:span="14")
            el-form-item(label="库区名称", prop="name")
              el-input(style="max-width: 80%", v-model="warehouse.name", clearable)
        el-row
          el-col(:span="14")
            el-form-item(label="库管员", prop="manager")
              el-input(style="max-width: 80%", v-model="warehouse.manager", clearable)
        el-row
          el-col(:span="14")
            el-form-item(label="库管电话", prop="phone")
              el-input(style="max-width: 80%", v-model="warehouse.phone", clearable)
        el-row
          el-col(:span="14")
            el-form-item(label="主营产品", prop="product")
              el-input(style="max-width: 80%", v-model="warehouse.product", clearable)
        el-row.mt-10(style="padding-left: 5%")
          el-button(type="primary", @click="formSubmit('warehouseForm')") {{ routeType == 'edit' ? '更新' : '保存' }}
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
      breadItems: [],
      warehouse: {
        name: '',
        manager: '',
        phone: '',
        product: ''
      },
      formRules: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        manager: [{ required: true, message: '不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '不能为空', trigger: 'blur' }],
        product: [{ required: false, message: '不能为空', trigger: 'blur' }]
      },
      routeType: ''
    }
  },
  beforeMount() {
    console.log(this.$route)
    this.routeType = this.$route.query.type || ''
    if (this.routeType === 'add') {
      this.breadItems = ['评价管理', '评价新增']
    } else if (this.routeType === 'edit') {
      this.breadItems = ['评价管理', '评价编辑']
      this.getWarehouseInfo()
    }
  },
  methods: {
    async getWarehouseInfo() {
      try {
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: this.apiList.local.comment + this.$route.query.id
          }
        )
        if (data.return_code === 0) {
          console.log(data)
          this.warehouse.name = data.obj.areaName
          this.warehouse.manager = data.obj.areaLeader
          this.warehouse.phone = data.obj.leaderPhone
          this.warehouse.product = data.obj.mainProduct
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.msgShow(this, e.message || '网络异常')
      }
    },
    formSubmit(formName) {
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
        // const body = Object.assign({}, this.warehouse)
        let params = {
          areaName: this.warehouse.name,
          areaLeader: this.warehouse.manager,
          leaderPhone: this.warehouse.phone,
          mainProduct: this.warehouse.product
        }
        if(this.routeType == 'edit') {
          params = {
            id: this.$route.query.id,
            areaName: this.warehouse.name,
            areaLeader: this.warehouse.manager,
            leaderPhone: this.warehouse.phone,
            mainProduct: this.warehouse.product
          }
        }
        const { data } = await this.apiStreamPost(
          '/proxy/common/post',
          {
            url: this.apiList.local.commentConfig,
            params: params
          }
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(
            this,
            this.routeType === 'edit' ? '更新成功' : '保存成功',
            'success'
          )
          this.jump('/appraise/set')
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
