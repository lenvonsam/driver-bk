export default function({ redirect, route, store }) {
  console.log('user login:>>', store.state.user.isLogin)
  if (!store.state.user.isLogin && route.path !== '/login') {
    store.state.globalErrorMsg = '用户过期或未登录'
    redirect('/login')
  } else {
    store.state.currentMenus = store.state.allMenus
  }
  // if (store.state.user.isLogin && store.state.user.currentUser.id !== 1) {
  // 设置用户的菜单
  // const userAuths = store.state.user.currentUser.auths
  // const userAuthGroup = _.groupBy(userAuths, itm => {
  //   return itm.fkMenu.parent.factOrder
  // })
  // let currentMenus = []
  // Object.keys(userAuthGroup).map(k => {
  //   let groupAuth = userAuthGroup[k]
  //   let firstMenu = {
  //     title: groupAuth[0].fkMenu.parent.name,
  //     iconClass: groupAuth[0].fkMenu.parent.iconClass
  //   }
  //   let allMenus = []
  //   groupAuth.map(itm => {
  //     allMenus.push(itm.fkMenu)
  //   })
  //   allMenus = _.orderBy(allMenus, ['factOrder', 'asc'])
  //   let secMenus = []
  //   allMenus.map(itm => {
  //     let secMenu = {
  //       title: itm.name,
  //       url: itm.pageUrl
  //     }
  //     secMenus.push(secMenu)
  //   })
  //   firstMenu.subItems = secMenus
  //   currentMenus.push(firstMenu)
  // })
  //   store.state.currentMenus = []
  // } else if (
  //   store.state.user.isLogin &&
  //   store.state.user.currentUser.id === 1
  // ) {
  //   store.state.currentMenus = Object.assign([], store.state.allMenus)
  // }
  // let menus = []
  // store.state.currentMenus.map(itm => {
  //   menus = _.concat(menus, itm.subItems)
  // })
  // let idx = 0
  // if (route.path !== '/')
  //   idx = menus.findIndex(itm => route.path.startsWith(itm.url))
  // if (idx >= 0) {
  //   store.state.currentMenus.map((itm, idx) => {
  //     let subIdx = itm.subItems.findIndex(sim => route.path.startsWith(sim.url))
  //     if (subIdx >= 0) store.state.currentPathIdx = `${idx + 1}-${subIdx + 1}`
  //   })
  // } else {
  //   redirect('/error')
  // }
}
