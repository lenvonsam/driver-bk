<template lang="pug">
.wuhan-container  
  .header
    .col
      .qrcode(:style="{backgroundImage: 'url(' + img + ')'}")
        .icon 
  .body
    .ft-20.ft-bold.text-left 登记信息
    el-form.mt-30(label-width="120px", size="small", :rules="formRules" ,ref="wuhanForm", :model="formObj")
      el-form-item(:label="item.lbl", v-for="(item, idx) in formArray", :key="idx",:prop="item.key")
        el-select(v-if="item.type === 'select'", v-model="formObj[item.key]", style="width: 100%")
          el-option(v-for="(opts, optIdx) in item.selectArr", :label="opts.lbl", :value="opts.val", :key="optIdx")
        el-input-number.full-width(:disabled="item.disabled", v-else-if="item.type==='number'", v-model="formObj[item.key]", type="number", :min="34.5", :max="45", :step="0.1")
        el-input(:disabled="item.disabled", v-else, v-model="formObj[item.key]")
      el-form-item
        el-button(type="primary", @click="submitForm('wuhanForm')") 提交
        el-button.ml-15(@click="resetForm('wuhanForm')") 重置
</template>
<script>
import { Event } from 'leancloud-realtime'
export default {
  data() {
    return {
      img: require('../../static/imgs/qrcode.png'),
      formObj: {
        name: '',
        idNo: '',
        phone: '',
        temperature: '',
        hasCouch: '否',
        hasException: '否',
        remark: ''
      },
      formRules: {
        temperature: [
          { required: true, message: '体温不能为空', trigger: 'blur' }
        ]
      },
      formArray: [
        {
          lbl: '姓名',
          disabled: true,
          key: 'name'
        },
        {
          lbl: '身份证号',
          disabled: true,
          type: 'text',
          key: 'idNo'
        },
        {
          lbl: '手机号码',
          disabled: true,
          key: 'phone',
          type: 'text'
        },
        {
          lbl: '当前体温',
          key: 'temperature',
          disabled: false,
          require: true,
          type: 'number'
        },
        {
          lbl: '是否咳嗽',
          type: 'select',
          key: 'hasCouch',
          selectArr: [
            {
              lbl: '否',
              val: '否'
            },
            {
              lbl: '是',
              val: '是'
            }
          ]
        },
        {
          lbl: '是否有其他异常',
          type: 'select',
          key: 'hasException',
          selectArr: [
            {
              lbl: '否',
              val: '否'
            },
            {
              lbl: '是',
              val: '是'
            }
          ]
        },
        {
          lbl: '备注',
          key: 'remark',
          type: 'text',
          disabled: false
        }
      ],
      remoteObj: {}
    }
  },
  beforeMount() {
    this.remoteLogin()
  },
  methods: {
    async remoteLogin() {
      try {
        const client = await this.lcLogin()
        client.on(Event.MESSAGE, (message, conv) => {
          console.log('conv message', message)
          console.log('conv', conv)
          if (message.type === -1 && message.from === 'whdriver') {
            this.remoteObj = JSON.parse(message.text)
            console.log('remoteObj:>>', this.remoteObj)
            this.formObj.name = this.remoteObj.name
            this.formObj.phone = this.remoteObj.phone
            this.formObj.idNo = this.remoteObj.idNo
            this.$forceUpdate()
          }
        })
      } catch (err) {
        this.msgShow(this, err)
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.remoteRecord()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async remoteRecord() {
      try {
        this.remoteObj.temperature = this.formObj.temperature
        this.remoteObj.hasCouch = this.formObj.hasCouch
        this.remoteObj.hasException = this.formObj.hasException
        this.remoteObj.remark = this.formObj.remark
        const { data } = await this.apiStreamPost(
          '/proxy/common/post',
          {
            url: this.apiList.local.driverRecord,
            params: this.remoteObj
          },
          'post'
        )
        console.log('data', data)
        if (data.return_code === 0) {
          this.msgShow(this, '签到成功', 'success')
          this.resetForm('wuhanForm', 'signed')
        } else {
          this.msgShow(this, data.errMsg)
        }
      } catch (e) {
        console.error(e)
      }
    },
    resetForm(formName, text = 'kickout') {
      this.$refs[formName].resetFields()
      this.kickUser(text)
    },
    kickUser(text = 'kickout') {
      this.lcText(text)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/stylus/common'
.wuhan-container
  width 100%
  overflow hidden
  .header
    height 400px
    background #409EFF
    display flex
    align-items center
    justify-content center
    .qrcode
      width 200px
      height 200px
      margin 0 auto
      position relative
      background-size cover
      .icon
        position absolute
        height 200px
        width 200px
        background-image url('../../static/imgs/temperature.png')
        background-size cover
        right -170px
        top 0px
        z-index 50
  .body
    max-width 380px
    margin 0 auto
    padding 15px
    /deep/ .el-form-item__label
      font-weight bold
</style>
