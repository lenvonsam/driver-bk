// const url = require('url')
const fs = require('fs')

const url = require('url')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const rqt = require('request')
// const qs = require('qs')

const express = require('express')
const router = express.Router()
const app = express()
const hptl = require('../utils/httpUtil')

// const proxyUrl = 'http://localhost:6889/'
const proxyUrl = 'http://192.168.20.148:8080/driver-bk/'

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

router.post('/logout', (req, res) => {
  if (req.session.currentUser) delete req.session.currentUser
  res.json({ return_code: 0 })
})

router.post('/login', (req, res) => {
  const body = req.body
  console.log('session user:>>', req.session.currentUser)
  console.log('body:>>', body)
  if (body.username === 'admin' && body.pwd === 'admin') {
    req.session.currentUser = {
      id: 1,
      name: '管理员'
    }
    res.json({ return_code: 0, user: req.session.currentUser })
  } else {
    res.json({ return_code: -1, msg: '用户名或密码错误' })
  }
})

router.post('/fileUpload', multipartMiddleware, (req, res) => {
  console.log('file upload req:>>', req.files)
  const url_parts = url.parse(req.url, true)
  let action = ''
  if (req.body.action) {
    action = req.body.action
  } else {
    action = url_parts.query.action
  }
  // var formData = new FormData()
  // formData.append('action', req.body.action)
  // formData.append('upfile', fs.createReadStream(req.files.upfile.path))
  const formData = {
    action: action,
    upfile: fs.createReadStream(req.files.img.path)
  }
  rqt.post(
    {
      url: proxyUrl + 'file/uedit/upload',
      formData: formData
      // headers: { 'zhdcrm-proxy-token': hptl.proxyToken('zhdcrm') }
    },
    function(err, resp, body) {
      console.log('err:>>', err)
      console.log('body:>>', typeof body)
      fs.unlink(req.files.img.path, function(err) {
        if (err) console.error(err)
        else console.log('temp file delete success')
      })
      res.send(body)
    }
  )
})

router.post('/common/post', (req, res) => {
  const body = req.body
  console.log('----------1', body)
  hptl.httpPost(proxyUrl + body.url, body.params).then(
    ({ data }) => {
      // req.session.currentUser = currentUser
      console.log('post data:>>', data)
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ return_code: -1, msg: '网络异常' })
    }
  )
})

router.post('/common/put', (req, res) => {
  const body = req.body
  console.log(body)
  hptl.httpPut(proxyUrl + body.url, body.params).then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ return_code: -1, msg: '网络异常' })
    }
  )
})

router.post('/common/get', (req, res) => {
  const body = req.body
  const paramsArr = []
  for (const key in body.params) {
    paramsArr.push(key + '=' + body.params[key])
  }
  const paramsStr = '?' + paramsArr.toString().replace(/,/g, '&')
  hptl.httpGet(encodeURI(proxyUrl + body.url + paramsStr)).then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ return_code: -1, msg: '网络异常' })
    }
  )
})

router.post('/common/del', (req, res) => {
  const body = req.body
  hptl.httpDelete(proxyUrl + body.url, body.params).then(
    ({ data }) => {
      res.json(data)
    },
    err => {
      console.log(err)
      res.json({ return_code: -1, msg: '网络异常' })
    }
  )
})

module.exports = router
// Export the server middleware
// export default {
//   path: '/api',
//   handler: router
// }
