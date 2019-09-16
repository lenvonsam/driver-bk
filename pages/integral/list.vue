<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  el-tabs.mt-15(type="border-card", v-model="currentTab")
    el-tab-pane(label="积分获取", name="0")
      basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize", @rowEdit="prowClick", :rightPart="false", @pageChange="getPgchange")
    el-tab-pane(label="积分消费", name="1")
      basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize", @rowEdit="prowClick", :rightPart="false", @pageChange="outPgchange")
</template>

<script>
export default {
  layout: 'main',
  data() {
    return {
      breadItems: ['积分管理', '积分列表'],
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
            lbl: '积分名称',
            prop: 'goodName'
          },
          {
            lbl: '单次积分',
            prop: 'goodIntegral',
            type: 'object',
            factValue(row) {
              return (row.type === 0 ? '+' : '-') + row.goodIntegral
            }
          },
          {
            lbl: '司机名称',
            prop: 'driverName'
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
    // 积分获取分页
    getPgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    // 积分消费分页
    outPgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    async loadData() {
      try {
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: this.apiList.local.driverIntegral,
            params: {
              currentPage: this.currentPage,
              pageSize: this.gPageSize,
              type: Number(this.currentTab)
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
