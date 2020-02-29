const { Realtime, TextMessage } = require('leancloud-realtime')

const realTime = new Realtime({
  appId: 'Gy7tNhrlrQOv1fhDK5pnvrOm-gzGzoHsz',
  appKey: 'xefikoI4r3PC7JwrsdQhPF7u',
  server: 'https://gy7tnhrl.lc-cn-n1-shared.com'
})

let currentClient = null
let currentConv = null

export default {
  login(username = 'whadmin') {
    return new Promise((resolve, reject) => {
      if (currentConv) {
        resolve()
      } else {
        realTime
          .createIMClient(username)
          .then(user => {
            currentClient = user
            currentClient
              .createConversation({
                members: ['whdriver'],
                name: 'wuhan driver & admin',
                unique: true
              })
              .then(conv => {
                currentConv = conv
                resolve(currentConv)
              })
              .catch(err => {
                console.error('conv error:>>', err)
                reject(err)
              })
          })
          .catch(err => {
            console.error('login error:>>', err)
            reject(err)
          })
      }
    })
  },
  sendTextMsg(msg) {
    return new Promise((resolve, reject) => {
      if (currentConv) {
        currentConv
          .send(new TextMessage(msg))
          .then(msg => {
            resolve()
          })
          .catch(err => {
            console.log('msg error:>>', err)
            reject(err)
          })
      } else {
        reject(new Error('empty conversation'))
      }
    })
  },
  clientExit() {
    return new Promise((resolve, reject) => {
      if (currentClient) {
        currentClient.close
          .then(() => {
            currentClient = null
            currentConv = null
            resolve()
          })
          .catch(err => {
            reject(err)
          })
      }
    })
  }
}
