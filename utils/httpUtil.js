const axios = require('axios')
const Qs = require('qs')
const sha1 = require('sha1')
const obj = {
  proxyToken(key) {
    let date = new Date()
    if (date.getTimezoneOffset() !== -480) {
      console.log('currentTimezone:>>>', date.getTimezoneOffset())
      date = new Date(date.getTime() + 480 * 60 * 1000)
    }
    const dateStr =
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1 > 9
        ? date.getMonth() + 1
        : '0' + (date.getMonth() + 1)) +
      '-' +
      (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
    return sha1(dateStr + key)
  },
  commonHttp(method, url, body) {
    return axios({
      method: method,
      url: url,
      params: body,
      // headers: {
      //   'zhdcrm-proxy-token': this.proxyToken('zhdcrm')
      // },
      paramsSerializer: params => {
        return Qs.stringify(params, { arrayFormat: 'brackets' })
      }
    })
  },
  httpGet(url) {
    return axios({
      method: 'get',
      url: url,
      headers: {
        'zhdcrm-proxy-token': this.proxyToken('zhdcrm')
      }
    })
  },
  httpPut(url, body) {
    return obj.commonHttp('put', url, body)
  },
  httpPost(url, body) {
    return obj.commonHttp('post', url, body)
  },
  httpPostForm(url, body) {
    return axios({
      method: 'post',
      url: url,
      params: body,
      headers: {
        // 'zhdcrm-proxy-token': this.proxyToken('zhdcrm'),
        'Content-Type': 'multipart/form-data'
      },
      paramsSerializer: params => {
        return Qs.stringify(params, { arrayFormat: 'brackets' })
      }
    })
  },
  httpDelete(url, body) {
    return obj.commonHttp('delete', url, body)
  },
  httpStreamPost(url, body) {
    return axios.post(url, body)
  }
}

module.exports = obj
