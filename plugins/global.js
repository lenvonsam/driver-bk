import Vue from 'vue'
import breadcrumb from '@/components/Breadcrumb.vue'
import basicTable from '@/components/BasicTable.vue'

const componets = {
  breadcrumb,
  basicTable
}

Object.keys(componets).map(itm => {
  Vue.component(itm, componets[itm])
})
