<template lang="pug">
.wuhan-container.vertical
  .header
    .col
      .qrcode(:style="{backgroundImage: 'url(' + img + ')'}")
        .icon 
  .body
    .ft-20.ft-bold.text-left 登记信息
    el-form.mt-30(label-width="120px", size="large", :rules="formRules" ,ref="wuhanForm", :model="formObj")
      el-form-item(:label="item.lbl", v-for="(item,idx) in formArray", :key="idx", :prop="item.key")
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
      img: require('../../static/imgs/qrcode.jpg'),
      numReg: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,
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
        ],
        name: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
        idNo: [{ required: true, message: '身份证不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '手机号不能为空', trigger: 'blur' }]
      },
      formArray: [
        {
          lbl: '姓名',
          disabled: false,
          key: 'name'
        },
        {
          lbl: '身份证号',
          disabled: false,
          type: 'text',
          key: 'idNo'
        },
        {
          lbl: '手机号码',
          disabled: false,
          key: 'phone',
          type: 'text'
        },
        {
          lbl: '车牌号',
          disabled: false,
          key: 'carNo',
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
      remoteObj: {},
      recordCount: 0
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
          if (message.type === -1 && message.from === 'whdriver') {
            this.remoteObj = JSON.parse(message.text)
            console.log('remoteObj:>>', this.remoteObj)
            this.$refs.wuhanForm.resetFields()
            this.getDayRecordCount()
          }
        })
      } catch (err) {
        this.msgShow(this, err)
      }
    },
    async getDayRecordCount() {
      try {
        const url = this.apiList.local.driverDayRecordCount.replace(
          '$',
          this.remoteObj.id
        )
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: url
          },
          'get'
        )
        console.log('data', data)
        this.recordCount = data.count || 0
        if (data.return_code === 0 && data.count > 0) {
          await this.apiStreamPost(
            '/proxy/common/post',
            {
              url: this.apiList.local.driverRecord,
              params: this.remoteObj
            },
            'post'
          )
          this.remoteObj = {}
          this.kickUser('kickUser')
          this.confirmDialog(this, '此人今天已测过体温')
          // this.msgShow(this, '此人今天已测过体温')
        } else {
          this.formObj.name = this.remoteObj.name
          this.formObj.phone = this.remoteObj.phone
          this.formObj.idNo = this.remoteObj.idNo
          this.formObj.carNo = this.remoteObj.carNo
        }
        this.$forceUpdate()
      } catch (e) {
        console.error(e)
        this.formObj.name = this.remoteObj.name
        this.formObj.phone = this.remoteObj.phone
        this.formObj.idNo = this.remoteObj.idNo
        this.formObj.carNo = this.remoteObj.carNo
        this.recordCount = 0
        this.$forceUpdate()
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
        if (!this.mobileReg(this.formObj.phone)) {
          this.msgShow(this, '请输入正确的手机号')
          return
        }
        if (!this.idNoReg(this.formObj.idNo)) {
          this.msgShow(this, '请输入正确身份证号')
          return
        }
        if (!this.numReg.test(this.formObj.temperature)) {
          this.msgShow(this, '温度最多两位小数')
          return
        }
        if (!this.remoteObj.id > 0 && this.recordCount > 0) {
          this.msgShow(this, '非法数据，无法提交')
          return
        }
        this.remoteObj.hasCouch = this.formObj.hasCouch
        this.remoteObj.hasException = this.formObj.hasException
        this.remoteObj.remark = this.formObj.remark
        this.remoteObj.carNo = this.formObj.carNo
        this.remoteObj.temperature = Number(this.formObj.temperature).toFixed(2)
        this.remoteObj.name = this.formObj.name
        this.remoteObj.idNo = this.formObj.idNo
        this.remoteObj.phone = this.formObj.phone
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
          this.remoteObj = {}
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
  height 100vh
  &.vertical
    display flex
    align-items center
    .header
      height 100vh
      width 700px
  .header
    height 400px
    background #409EFF
    display flex
    align-items center
    justify-content center
    .qrcode
      width 290px
      height 320px
      margin 0 auto
      position relative
      background-size cover
      .icon
        position absolute
        height 250px
        width 250px
        background-image url('../../static/imgs/temperature.png')
        background-size cover
        right -213px
        top 0px
        z-index 50
  .body
    max-width 500px
    margin 0 auto
    padding 15px
    /deep/ .el-form-item__label
      font-weight bold
    /deep/ .el-input input
      font-size 20px
</style>
