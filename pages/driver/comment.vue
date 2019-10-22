<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  .pt-15
    basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize", @rowEdit="prowClick", :rightPart="false", @pageChange="tablePgChange")
</template>

<script>
export default {
  layout: 'main',
  data() {
    return {
      breadItems: ['积分管理', '司机评论'],
      tableValue: {
        actions: [
          // {
          //   lbl: '新增',
          //   type: 'add'
          // }
        ],
        hasCbx: false,
        tableHead: [
          {
            lbl: '司机名称',
            prop: 'driverName'
          },
          {
            lbl: '评价库区',
            prop: 'content'
          },
          {
            lbl: '装货速度',
            prop: 'starSpeed'
          },
          {
            lbl: '服务态度',
            prop: 'starService'
          },
          {
            lbl: '排队秩序',
            prop: 'starLine'
          },
          {
            lbl: '协助理货',
            prop: 'starAssist'
          },
          {
            lbl: '合理收费',
            prop: 'starFee'
          }
        ],
        tableData: []
      },
      currentPage: 0,
      total: 0,
      currentTab: '0'
    }
  },
  watch: {
    currentTab(newVal, oldVal) {
      this.currentPage = 0
      this.tableValue.tableData = []
      this.loadData()
    }
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    tablePgChange(val) {
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
            url: this.apiList.local.driverComment,
            params: {
              currentPage: this.currentPage,
              pageSize: this.gPageSize
              // type: Number(this.currentTab)
            }
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
