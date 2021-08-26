<template lang="pug">
div
  div
    el-button-group.mb-15(v-if="tableValue.actions && tableValue.actions.length > 0")
      template(v-for="(btn, idx) in tableValue.actions")
        template(v-if="btn.type == 'export'")
          // el-button(:type="btn.class || 'default'", :size="btn.size ? btn.size : 'medium'")
          download-excel.download-excel-style(:data="jsonData" :fields="jsonFields" :name="getJsonName")
            span {{btn.lbl}}
        template(v-else)
          el-button(:type="btn.class || 'default'", @click="actionBtnClick(btn.type)", :size="btn.size ? btn.size : 'medium'") {{btn.lbl}}
    .float-right(v-if="rightPart")
      slot(name="right-part")
        el-input(size="medium", placeholder="搜索", v-model="searchVal")
          template(slot="append")
            el-button(icon="el-icon-search", @click="rightTopSearch", style="border-right: 1px solid #ddd")
            el-button(icon="el-icon-refresh", @click="rightTopReset")
  .searchArea(v-if="searchArea")
    el-form
      el-row
        el-col(:span="6")
          el-form-item(label="库区：")
            el-select(v-model="selectWarehouse" placeholder="请选择" size="small" @change="selectChange")
              el-option(v-for="item in tableValue.warehouses" :key="item.value" :label="item.label" :value="item.value")
        el-col(:span="7")
          el-form-item(label="结束日期：")
            el-date-picker(v-model="startDate" value-format="yyyy-MM-dd", format="yyyy-MM-dd", size="small", @change="startDateChange")
        el-col(:span="7")
          el-form-item(label="结束日期：")
            el-date-picker(v-model="endDate" value-format="yyyy-MM-dd", format="yyyy-MM-dd", size="small", @change="endDateChange")
        el-col(:span="4")
          el-button(type="primary", @click="search", size="small", style="margin-top:4px;") 搜索
  slot(name="searchPart")
  el-table(ref="multipleTable", :data="currentData", v-loading="loading", style="width: 100%", border, @selection-change="handleSelectionChange", @current-change="handleCurrentChange", :default-sort="{order: 'descending'}", size="medium", :filter-change="tableFiler", @sort-change="sortChange", highlight-current-row)
    el-table-column(type="index" width="80" label="序号")
    el-table-column(v-if="tableValue.hasCbx", type="selection", width="55")
    template(v-for="head in tableValue.tableHead")
      el-table-column(v-if="head.type == 'link'", :label="head.lbl", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          a(:href="head.linkUrl + '?id=' + scope.row.id") {{scope.row[head.prop]}}
      el-table-column(v-else-if="head.type == 'linkObject'", :label="head.lbl", :width="head.width? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          a(:href="head.linkUrl + '?id=' + head.factValue(scope.row[head.prop]).id") {{head.factValue(scope.row[head.prop]).name}}
      el-table-column(v-else-if="head.type == 'object'", :label="head.lbl", :width="head.width? head.width : 'auto'")
        template(slot-scope="scope")
          span {{head.factValue(scope.row)}}
      el-table-column(v-else-if="head.type == 'image'", :label="head.lbl", :width="head.width? head.width: 'auto'")
        template(slot-scope="scope")
          img(:src="head.factValue(scope.row[head.prop])", @click="openRowImgModal(head.factValue(scope.row[head.prop]))", style="height: 100%; width: 100%;object-fit: cover; max-height: 80px;")
      el-table-column(v-else-if="head.type == 'enum'", :label="head.lbl", :width="head.width? head.width : 'auto'")
        template(slot-scope="scope")
          span {{head.enumMap[scope.row[head.prop]]}}
      el-table-column(v-else-if="head.type == 'action'", :align="head.align ? head.align : 'left'" :fixed="head.fixed", :label="head.lbl || '操作'", :width="head.width ? head.width : 'auto'", :min-width="head.minWidth? head.minWidth : 'auto'")
        template(slot-scope="scope")
          template(v-for="btn in head.actionBtns")
            el-button(type="text", :type="btn.class ? btn.class : 'default'", :size="btn.size ? btn.size : 'small'" @click.stop="handleRowBtn(scope.$index, scope.row, btn.type)", v-if="showRowBtn(btn, scope.row)") {{btn.lbl}}
      el-table-column(v-else-if="head.type == 'date'", :label="head.lbl", :prop="head.prop", :width="head.width ? head.width : 'auto'")
        template(slot-scope="scope")
          span {{date2Str(scope.row[head.prop])}}
      el-table-column(v-else-if="head.type == 'datetime'", :label="head.lbl", :prop="head.prop", , :width="head.width ? head.width : 'auto'")
        template(slot-scope="scope")
          span {{date2Time(scope.row[head.prop])}}
      el-table-column(v-else, :label="head.lbl", :prop="head.prop", :align="head.align ? head.align : 'left'", :width="head.width ? head.width : 'auto'")
  .padding.text-right(v-if="!tableValue.footerHide")
    el-pagination(:current-page="currentPage", :page-size="pageSize", background, layout="prev, pager, next, jumper", :total="total", @current-change="pgCurrentChange")
  el-dialog(:visible="previewShow", @close="previewShow = false", append-to-body)
    img(:src="rowImgPath", width="100%")
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  props: {
    tableValue: {
      type: null,
      default: false
    },
    currentPage: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 8
    },
    loading: {
      type: Boolean,
      default: false
    },
    rightPart: {
      type: Boolean,
      default: true
    },
    searchArea: {
      type: Boolean,
      default: false
    },
    jsonFields: {
      type: Object,
      default: () => {}
    },
    jsonData: {
      type: Array,
      default: () => []
    },
    jsonName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectWarehouse: '',
      startDate: '',
      endDate: '',
      currentData: [],
      regionOptions: [],
      supplyCatalogOptions: [],
      comboOptions: [],
      acctOptions: [],
      orgOptions: [],
      isVerify: true,
      searchVal: '',
      previewShow: false,
      rowImgPath: ''
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.currentUser
    })
  },
  watch: {
    'tableValue.tableData': {
      handler(newVal, oldVal) {
        this.currentData = Object.assign([], newVal)
      },
      deep: true
    }
  },
  beforeMount() {
    this.$nextTick(() => {
      this.currentData = Object.assign([], this.tableValue.tableData)
    })
  },
  computed: {
    getJsonName: function() {
      return this.jsonName + moment(new Date()).format('YYYYMMDDHHmmss') + '.xls'
    }
  },
  methods: {
    selectChange(value) {
      this.$emit('selectChange', value)
    },
    startDateChange(value) {
      this.$emit('startDateChange', value)
    },
    endDateChange(value) {
      this.$emit('endDateChange', value)
    },
    search(){
      this.$emit('search')
    },
    downloadImg(link_id) {
      this.$emit('downloadImg', link_id)
    },
    showRowBtn(btnObj, rowObj) {
      if (btnObj.showBtn) {
        return btnObj.showBtn(rowObj)
      } else {
        return true
      }
    },
    openRowImgModal(url) {
      this.rowImgPath = url
      this.previewShow = true
    },
    actionBtnClick(type) {
      this.$emit('actionBtnClick', type)
    },
    handleRowBtn(idx, row, btnType) {
      this.$emit('rowEdit', idx, row, btnType)
    },
    handleSelectionChange(rows) {
      this.$emit('chooseData', rows)
    },
    handleCurrentChange(row) {
      this.$emit('handleCurrentChange', row)
    },
    pgCurrentChange(val) {
      this.$emit('pageChange', val)
    },
    rightTopSearch() {
      this.$emit('rightTopSearch', this.searchVal)
    },
    rightTopReset() {
      this.searchVal = ''
      this.rightTopSearch()
    },
    tableFiler(row, col) {
      // console.log('row')
      // console.log(row)
      // console.log('col')
      // console.log(col)
    },
    sortChange(column, prop, order) {
      const obj = {
        sortable: column.sortable,
        order: column.order,
        property: column.prop
      }
      console.log('********** sortChange >>', obj)
      this.$emit('sort', obj)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../assets/stylus/color';

.download-excel-style
  padding 8px 16px
  color #fff
  border-radius 4px
  background-color #409EFF
.el-table__row {
  .cell {
    a {
      color: $color-main;

      &:hover {
        cursor: pointer;
      }
    }

    i.iconfont.icon-locka:hover, i.iconfont.icon-lockb:hover {
      cursor: pointer;
    }
  }
}
</style>
