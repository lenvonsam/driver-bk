<template lang="pug">
  div
    el-upload(:action="fileUploadUrl",list-type="picture-card", :on-preview="handlePictureCardPreview",:before-upload="beforePicUpload",name="img", :data="localData",:file-list="picList",:on-success="uploadSuccess", :on-remove="picReomve")
      i.el-icon-plus
      .el-upload__tip(slot="tip") 只能上传jpg/png/jpeg文件，且不超过{{limitSize}}M,图片长宽建议{{picAdvice}}
    el-dialog(:visible.sync="dialogVisible", size="tiny", :append-to-body="isChild")
      img(width="100%", :src="dialogImageUrl")
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    },
    isChild: {
      type: Boolean,
      default: false
    },
    limitSize: {
      type: Number,
      default: 2
    },
    picAdvice: {
      type: String,
      default: '100 * 100'
    },
    // 额外表单参数
    extra: {
      type: null,
      default: false
    }
  },
  data() {
    return {
      picList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      localData: {
        action: 'uploadimage'
      }
    }
  },
  computed: {},
  watch: {
    value(newVal, oldVal) {
      if (newVal) {
        this.dialogImageUrl = newVal
        this.picList = [
          {
            url: this.dialogImageUrl,
            response: { url: this.dialogImageUrl }
          }
        ]
      } else {
        this.dialogImageUrl = ''
        this.picList = []
      }
    }
  },
  beforeMount() {
    if (this.value && this.value.url) {
      this.dialogImageUrl = this.value
      this.picList = [
        {
          name: 'fisrt.jpg',
          url: this.dialogImageUrl,
          response: { url: this.dialogImageUrl }
        }
      ]
    }
    if (this.extra) {
      delete this.extra.action
      Object.keys(this.extra).map(k => {
        this.localData[k] = this.extra[k]
      })
    }
  },
  methods: {
    handlePictureCardPreview(file) {
      console.log('pic on-preview')
      console.log(file)
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    beforePicUpload(file) {
      const imgType = file.type === 'image/png' || file.type === 'image/jpeg'
      const imgSize = file.size / 1000000 <= this.limitSize
      if (!imgType) {
        this.$message.error('上传图片格式错误!')
      }
      if (!imgSize) {
        this.$message.error('上传图片大不能超过' + this.limitSize + 'M!')
      }
      return imgType && imgSize
    },
    uploadSuccess(resp, file, fileList) {
      console.log('file resp', resp)
      console.log('file', file)
      console.log('file', fileList)
      this.picList = [file]
      this.$emit('input', file.response.url)
    },
    picReomve(file, fileList) {
      console.log(file)
      this.picList = []
      // 七牛异步删除
      this.apiStreamPost('/proxy/common/del', {
        url: '/file/qiniu',
        params: { url: file.url }
      })
      this.$emit('input', '')
    }
  }
}
</script>
