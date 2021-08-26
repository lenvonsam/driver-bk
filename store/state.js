export default {
  globalSuccessMsg: '',
  globalErrorMsg: '',
  currentMenus: [],
  currentPathIdx: '/product/list',
  allMenus: [
    {
      title: '商品管理',
      iconClass: 'el-icon-goods',
      subItems: [
        {
          title: '商品列表',
          url: '/product/list'
        },
        {
          title: '商品编辑',
          url: '/product/form'
        }
      ]
    },
    {
      title: '积分管理',
      iconClass: 'el-icon-present',
      subItems: [
        {
          title: '积分列表',
          url: '/integral/list'
        },
        {
          title: '司机评论',
          url: '/driver/comment'
        }
      ]
    },
    {
      title: '票券管理',
      iconClass: 'el-icon-postcard',
      subItems: [
        {
          title: '优惠券列表',
          url: '/quan/list'
        }
      ]
    },
    {
      title: '评价管理',
      iconClass: 'el-icon-postcard',
      subItems: [
        {
          title: '评价设置',
          url: '/appraise/set'
        },
        {
          title: '评价统计',
          url: '/appraise/list'
        }
      ]
    }
  ]
}
