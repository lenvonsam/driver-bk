<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  el-tabs.mt-15(type="border-card", v-model="currentTab")
    el-tab-pane(label="未使用", name="0")
      basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize",  :rightPart="false", @pageChange="unusedPgchange")
    el-tab-pane(label="已使用", name="1")
      basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize",  :rightPart="false", @pageChange="usedPgchange")
    el-tab-pane(label="已过期", name="2")
      basic-table(:tableValue="tableValue", @actionBtnClick="headBtnClick", :total="total", :currentPage="currentPage + 1", :pageSize="gPageSize",  :rightPart="false", @pageChange="expiredchange")
  el-dialog(title="票券核销", :visible.sync="dialogShow", center, width="30%")
    .text-center
      el-input(type="small", v-model="checkQuanCode", placeholder="请输入核销码", style="max-width: 60%")
    .dialog-footer(slot="footer")
      el-button(@click="dialogShow = false", size="small") 取消
      el-button(@click="callQuanCheck", type="primary", size="small") 核销
</template>

<script>
export default {
  layout: 'main',
  data() {
    return {
      breadItems: ['票券管理', '票券列表'],
      currentTab: '0',
      total: 0,
      tableValue: {
        actions: [
          {
            lbl: '核销',
            type: 'quanCheck'
          }
        ],
        hasCbx: false,
        tableHead: [
          {
            lbl: '票券名称',
            prop: 'title'
          },
          {
            lbl: '票券积分',
            prop: 'integral'
          },
          {
            lbl: '开始日期',
            prop: 'startDate'
          },
          {
            lbl: '截止日期',
            prop: 'endDate'
          },
          {
            lbl: '兑换码',
            prop: 'quanCode',
            type: 'object',
            factValue(row) {
              return row.quanCode.substring(2)
            }
          },
          {
            lbl: '状态',
            prop: 'status',
            type: 'object',
            factValue(row) {
              if (row.status === 0) {
                return '未使用'
              } else if (row.status === 1) {
                return '已使用'
              } else {
                return '已过期'
              }
            }
          }
        ],
        tableData: []
      },
      currentPage: 0,
      dialogShow: false,
      checkQuanCode: ''
    }
  },
  watch: {
    currentTab(newVal, oldVal) {
      this.currentTab = newVal
      this.currentPage = 0
      this.loadData()
    }
  },
  beforeMount() {
    this.loadData()
  },
  methods: {
    headBtnClick(type) {
      if (type === 'quanCheck') {
        // 核销票据
        this.checkQuanCode = ''
        this.dialogShow = true
      }
    },
    async callQuanCheck() {
      try {
        this.pageShow(this)
        const { data } = await this.apiStreamPost(
          '/proxy/common/post',
          {
            url: this.apiList.local.quanCheck,
            params: {
              code: this.checkQuanCode.trim()
            }
          },
          'post'
        )
        this.pageHide(this)
        if (data.return_code === 0) {
          this.msgShow(this, '核销成功', 'success')
          this.currentTab = '1'
          this.currentPage = 0
          this.loadData()
          this.dialogShow = false
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    // 未使用分页
    unusedPgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    // 已使用分页
    usedPgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    // 已过期分页
    expiredchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    async loadData() {
      try {
        this.pageShow(this)
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: this.apiList.local.quan,
            params: {
              currentPage: this.currentPage,
              pageSize: this.gPageSize,
              status: Number(this.currentTab)
            }
          },
          'get'
        )
        console.log('data', data)
        this.pageHide(this)
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
