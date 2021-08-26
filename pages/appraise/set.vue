<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  .pt-15
    basic-table(
      :tableValue="tableValue",
      :rightPart="false",
      :total="total",
      :currentPage="currentPage + 1",
      :pageSize="gPageSize",
      @actionBtnClick="headBtnClick",
      @pageChange="tablePgchange",
      @handleCurrentChange="handleCurrentChange"
      @downloadImg="downloadImg"
      @rowEdit="rowEdit"
    )
  div(id="qrcode")
</template>

<script>
export default {
  layout: 'main',
  data() {
    return {
      breadItems: ['评价管理', '评价统计'],
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'add',
            class: 'primary'
          },
          {
            lbl: '编辑',
            type: 'edit',
            class: 'success'
          },
          {
            lbl: '删除',
            type: 'delete',
            class: 'danger'
          }
        ],
        hasCbx: false,
        tableHead: [
          // {
          //   lbl: '序号',
          //   prop: 'id'
          // },
          {
            lbl: '库区',
            prop: 'areaName',
            align: 'center'
          },
          {
            lbl: '库管员',
            prop: 'areaLeader',
            align: 'center'
          },
          {
            lbl: '库管员电话',
            prop: 'leaderPhone',
            align: 'center'
          },
          {
            lbl: '主营产品',
            prop: 'mainProduct',
            align: 'center'
          },
          {
            lbl: '评价二维码图片',
            type: 'action',
            align: 'center',
            actionBtns: [
              {
                lbl: '下载评价二维码',
                type: 'download',
                class: 'primary',
                size: 'mini'
              }
            ]
          }
        ],
        tableData: []
      },
      currentPage: 0,
      total: 0,
      currentChooseId: null
    }
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    rowEdit(idx, row, btnType) {
      console.log(idx, row, btnType)
      const qrcode = new this.QRCode('qrcode', {
        width: 132,
        height: 132,
        text: `http://172.16.16.234:8000/appraise/star?id=${row.id}`, // 二维码地址
        colorDark: '#000',
        colorLight: '#fff'
      })
      const myCanvas = document
        .getElementById('qrcode')
        .getElementsByTagName('canvas')
      const a = document.createElement('a')
      a.href = myCanvas[0].toDataURL('image/png')
      a.download = `二维码-${row.areaLeader}-${row.areaName}`
      a.click()
      this.$message({
        message: '正在下载保存',
        type: 'success'
      })
    },
    handleCurrentChange(row) {
      console.log(row)
      if (row) {
        this.currentChooseId = row.id
      }
    },
    tablePgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    headBtnClick(type) {
      console.log('type', type)
      if (type === 'add') {
        this.jump('/appraise/form?type=add')
      } else if (type === 'edit') {
        if (!this.currentChooseId) {
          this.msgShow(this, '请选择要编辑的库区')
        } else {
          this.jump('/appraise/form?type=edit&id=' + this.currentChooseId)
        }
      } else if (!this.currentChooseId) {
        this.msgShow(this, '请选择要删除的库区')
      } else {
        this.deleteItem(this.currentChooseId)
      }
    },
    async deleteItem(id) {
      try {
        const { data } = await this.apiDelete('/proxy/common/del', {
          url: this.apiList.local.comment + id
        })
        if (data.return_code === 0) {
          this.msgShow(this, '删除成功', 'success')
          this.currentChooseId = null
          const currentChooseIndex = this.tableValue.tableData.findIndex(
            item => {
              return item.id == id
            }
          )
          this.tableValue.tableData.splice(currentChooseIndex, 1)
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        console.error(e)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async loadData() {
      try {
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: this.apiList.local.commentConfig
          },
          'get'
        )
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        console.error(e)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
