<template lang="pug">
.content
  breadcrumb(:breadItems="breadItems")
  .pt-15
    basic-table(
      :tableValue="tableValue"
      :rightPart="false"
      :total="total"
      :currentPage="currentPage + 1"
      :pageSize="gPageSize"
      :searchArea="true"
      @actionBtnClick="headBtnClick"
      @rowEdit="prowClick"
      @pageChange="tablePgchange"
      @selectChange="selectChange"
      @startDateChange="startDateChange"
      @endDateChange="endDateChange"
      @search="search"
      :jsonFields="jsonFields"
      :jsonData="jsonData"
      :jsonName="jsonName"
    )
</template>

<script>
export default {
  layout: 'main',
  data() {
    return {
      breadItems: ['评价管理', '评价反馈'],
      tableValue: {
        actions: [
          {
            lbl: '导出',
            type: 'export',
            class: 'primary'
          }
        ],
        startDate: '',
        endDate: '',
        hasCbx: false,
        warehouse: '',
        warehouses: [],
        tableHead: [
          // {
          //   lbl: '序号',
          //   prop: 'index',
          //   width: '60px',
          //   align: 'center'
          // },
          {
            lbl: '库区',
            prop: 'areaName',
            align: 'center'
          },
          {
            lbl: '综合评分（满分5分）',
            prop: 'avgScore',
            width: '180px',
            align: 'center'
          },
          {
            lbl: '车辆出入库组织',
            prop: 'starOutIn',
            align: 'center'
          },
          {
            lbl: '装卸货效率',
            prop: 'starSpeed',
            align: 'center'
          },
          {
            lbl: '库区服务态度',
            prop: 'starService',
            align: 'center'
          },
          {
            lbl: '库区费用收取',
            prop: 'starFee',
            align: 'center'
          },
          {
            lbl: '人员积极性',
            prop: 'starPositive',
            align: 'center'
          },
          {
            lbl: '评价人',
            prop: 'nickName',
            align: 'center'
          },
          {
            lbl: '评价时间',
            prop: 'commentTime',
            align: 'center'
          }
        ],
        tableData: []
      },
      currentPage: 0,
      total: 0,
      warehouse: '',
      startDate: '',
      endDate: '',
      jsonFields: {
        // 序号: 'index', // 常规字段
        // 库区: {
        //   field: 'areaName',
        //   callback: value => {
        //     // 自定义回调函数
        //     return this.busiEventType[value] || value
        //   }
        // },
        库区: 'areaName',
        综合评分满分5分: 'avgScore',
        车辆出入库组织: 'starOutIn',
        装卸货效率: 'starSpeed',
        库区服务态度: 'starService',
        库区费用收取: 'starFee',
        人员积极性: 'starPositive',
        评价人: 'nickName',
        评价时间: 'commentTime'
      },
      jsonData: [],
      jsonName: '评价反馈',
      cid: '',
      startTime: '',
      endTime: ''
    }
  },
  beforeMount() {
    this.loadData()
    this.getWarehouses()
  },
  methods: {
    selectChange(value) {
      console.log(value)
      this.cid = value
    },
    startDateChange(value) {
      console.log(value)
      this.startTime = value
    },
    endDateChange(value) {
      console.log(value)
      this.endTime = value
    },
    search() {
      this.loadData()
    },

    tablePgchange(val) {
      this.currentPage = val - 1
      this.loadData()
    },
    headBtnClick(type) {
      console.log('type', type)
      if (type === 'out') {
        this.jump('/product/form?type=new')
      }
    },
    prowClick(idx, row, btnType) {
      if (btnType === 'edit') {
        this.jump('/product/form?type=edit&id=' + row.id)
      }
    },
    async getWarehouses() {
      try {
        const { data } = await this.apiStreamPost(
          '/proxy/common/get',
          {
            url: this.apiList.local.commentConfig
          },
          'get'
        )
        if (data.return_code === 0) {
          const list = data.list
          if (list.length) {
            list.unshift({
              id: '',
              areaName: '全部'
            })
            this.tableValue.warehouses = list.map(item => {
              return {
                value: item.id,
                label: item.areaName
              }
            })
          }
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
        this.pageShow(this, '处理中..')
        // const body = Object.assign({}, this.warehouse)
        const params = {
          cid: this.cid,
          startTime: this.startTime,
          endTime: this.endTime,
          currentPage: 0,
          pageSize: 10
        }
        if (!this.cid) {
          delete params.cid
        }
        if (!this.startTime) {
          delete params.startTime
        }
        if (!this.endTime) {
          delete params.endTime
        }
        const { data } = await this.apiStreamPost('/proxy/common/get', {
          url: this.apiList.local.driverComment,
          params: params
        })
        this.pageHide(this)
        if (data.return_code === 0) {
          this.tableValue.tableData = data.list
          this.total = data.total
          this.getExcelData(this.total)
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.pageHide(this)
        this.msgShow(this, e.message || '网络异常')
      }
    },
    async getExcelData(total) {
      try {
        const params = {
          cid: this.cid,
          startTime: this.startTime,
          endTime: this.endTime,
          currentPage: 0,
          pageSize: total
        }
        if (!this.cid) {
          delete params.cid
        }
        if (!this.startTime) {
          delete params.startTime
        }
        if (!this.endTime) {
          delete params.endTime
        }
        const { data } = await this.apiStreamPost('/proxy/common/get', {
          url: this.apiList.local.driverComment,
          params: params
        })
        if (data.return_code === 0) {
          console.log('excel数据', data.list)
          this.jsonData = data.list
        } else {
          this.msgShow(this, data.msg)
        }
      } catch (e) {
        this.msgShow(this, e.message || '网络异常')
      }
    }
  }
}
</script>
