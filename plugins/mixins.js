import Vue from 'vue'
import httpUtil from '../utils/httpUtil'
import elementUtil from '../utils/elmtUtil'
import apiList from '../utils/apiList'
// import lcUtil from '../utils/lc'

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const minixs = {
  data() {
    return {
      apiList,
      phoneReg: /^1[345789]\d{9}$/,
      gPageSize: 8,
      fileUploadUrl: '/proxy/fileUpload',
      lcProxyUrl:
        'https://mobileapp.xingyun361.com/quasarserverdev/common/ld/realtime'
      // bkProxyUrl: 'http://localhost:8668/api/'
    }
  },
  computed: {
    //   ...mapState({
    //     globalSuccessMsg: state => state.globalSuccessMsg
    //   })
  },
  watch: {
    '$store.state.globalSuccessMsg'(newVal, oldVal) {
      if (newVal !== '') this.msgShow(this, newVal, 'success')
    },
    '$store.state.globalErrorMsg'(newVal, oldVal) {
      if (newVal !== '') this.msgShow(this, newVal)
    }
  },
  methods: {
    isIE() {
      const userAgent = navigator.userAgent
      // 判断是否IE<11浏览器
      const isIE =
        userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1
      // 判断是否IE的Edge浏览器
      const isEdge = userAgent.indexOf('Edge') > -1 && !isIE
      const isIE11 =
        userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1
      console.log('userAgent', userAgent)
      if (isIE || isEdge || isIE11) {
        // this.$message.error('系统暂不支持ie浏览器，推荐使用chrome进行访问')
        alert('系统暂不支持ie浏览器，推荐使用chrome进行访问')
        return false
      }
      return true
    },
    jump(to) {
      if (this.$router) this.$router.push(to)
    },
    back() {
      if (this.$router) this.$router.go(-1)
    },
    fullScreen(element) {
      const requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen
      if (requestMethod) {
        requestMethod.call(element)
      } else if (typeof window.ActiveXObject !== 'undefined') {
        const wscript = new window.ActiveXObject('WScript.Shell')
        if (wscript !== null) wscript.SendKeys('{F11}')
      }
    },
    num2Str(num) {
      return num.toString()
    },
    date2Str(date) {
      if (date) {
        const years = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return [years, month, day].map(formatNumber).join('-')
      } else {
        return ''
      }
    },
    datetime2Str(date) {
      if (date) {
        const years = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours()
        const mins = date.getMinutes()
        const secds = date.getSeconds()
        const dateStr = [years, month, day].map(formatNumber).join('-')
        return dateStr + ' ' + [hours, mins, secds].map(formatNumber).join(':')
      } else {
        return ''
      }
    },
    time2Str(date) {
      if (date) {
        const hours = date.getHours()
        const mins = date.getMinutes()
        const secds = date.getSeconds()
        return [hours, mins, secds].map(formatNumber).join(':')
      } else {
        return ''
      }
    },
    getRandomColor() {
      return '#' + ((Math.random() * 0xffffff) << 0).toString(16)
    },
    apiGet: httpUtil.httpGet,
    apiPost: httpUtil.httpPost,
    apiStreamPost: httpUtil.httpStreamPost,
    pageShow: elementUtil.pageShow,
    pageHide: elementUtil.pageHide,
    msgShow: elementUtil.msgShow,
    confirmDialog: elementUtil.confirmDialog,
    commonValidate(context, keyArr, errorInfo = '必填字段不能为空') {
      let result = true
      for (let i = 0; i < keyArr.length; i++) {
        if (context[keyArr[i]].toString().trim().length === 0) {
          result = false
          this.msgShow(context, errorInfo)
          break
        }
      }
      return result
    },
    formValidate(ctx, formName) {
      return new Promise((resolve, reject) => {
        ctx.$refs[formName].validate(valid => {
          if (valid) {
            resolve('success')
          } else {
            reject(new Error('valid fail'))
          }
        })
      })
    },
    arr2DoubleArr(array, full = true, cols = 3) {
      const row = Math.ceil(array.length / cols)
      const doubleArr = []
      for (let i = 0; i < row; i++) {
        const tempRow = []
        for (let j = i * cols; j < (i + 1) * cols; j++) {
          if (j < array.length) {
            tempRow.push(array[j])
          } else if (full) tempRow.push('')
        }
        doubleArr.push(tempRow)
      }
      return doubleArr
    },
    getValidateCode() {
      // const basicArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      const basicArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      const basiCode = ['Z', 'H', '1', '8']
      basiCode.map((itm, idx) => {
        const rdmIdx = Math.floor(Math.random() * 100) % basicArray.length
        basiCode[idx] = basicArray[rdmIdx]
      })
      return basiCode.join('')
    },
    cstmListData(dataList, arrList) {
      const arr = []
      dataList.map(itm => {
        const obj = {}
        for (let i = 0; i < arrList.length; i++) {
          obj[arrList[i]] = itm[i]
        }
        arr.push(obj)
      })
      return arr
    },
    chineseReg(val) {
      const reg = /^[\u4e00-\u9fa5]+$/g
      return reg.test(val)
    },
    faxNumReg(val) {
      const reg = /^(\d{3,4}-)?\d{7,8}$/
      return reg.test(val)
    },
    mobileReg(mobile) {
      return this.phoneReg.test(mobile)
    },
    idNoReg(val) {
      const reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/
      return reg.test(val)
    }
    // leanclound
    // lcLogin: lcUtil.login,
    // lcText: lcUtil.sendTextMsg
  }
}
Vue.mixin(minixs)
