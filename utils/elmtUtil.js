let load = null
module.exports = {
  msgShow(context, text = '网络异常', type = 'error') {
    context.$message({
      message: text,
      type
    })
  },
  confirmDialog(
    context,
    text,
    manConfig = {},
    type = 'warning',
    title = '提示'
  ) {
    const defaultConfig = {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: type
    }
    for (const k in manConfig) {
      defaultConfig[k] = manConfig[k]
    }
    return context.$confirm(text, title, defaultConfig)
  },
  pageShow(context, loadText = '加载中...') {
    if (load) this.pageHide()
    load = context.$loading({
      lock: true,
      text: loadText,
      spinner: 'el-icon-loading',
      background: 'rgba(0,0,0,.7)'
    })
  },
  pageHide() {
    if (load) {
      load.close()
      load = null
    }
  }
}
