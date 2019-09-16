<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  .pt-15
    basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize", @rowEdit="prowClick", @pageChange="tablePgchange")
</template>

<script>
export default {
  layout: 'main',
  data() {
    return {
      breadItems: ['商品管理', '商品列表'],
      tableValue: {
        actions: [
          {
            lbl: '新增',
            type: 'add'
          }
        ],
        hasCbx: false,
        tableHead: [
          {
            lbl: '商品图片',
            prop: 'img',
            type: 'image',
            factValue(url) {
              return url
            }
          },
          {
            lbl: '商品名称',
            prop: 'name'
          },
          {
            lbl: '商品积分',
            prop: 'integral'
          },
          {
            lbl: '商品说明',
            prop: 'info'
          },
          {
            lbl: '期限说明',
            prop: 'rangeInfo'
          },
          {
            type: 'action',
            actionBtns: [
              {
                lbl: '修改',
                type: 'edit'
              }
            ]
          }
        ],
        tableData: []
      },
      currentPage: 0,
      total: 0
    }
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    tablePgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    headBtnClick(type) {
      console.log('type', type)
      if (type === 'add') {
        this.jump('/product/form?type=new')
      }
    },
    prowClick(idx, row, btnType) {
      if (btnType === 'edit') {
        this.jump('/product/form?type=edit&id=' + row.id)
      }
    },
    async loadData() {
      try {
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: 'api/product',
            params: { currentPage: this.currentPage, pageSize: this.gPageSize }
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
