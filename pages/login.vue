<template lang="pug">
.login-container
  .form
    .title 司机票券系统
    el-form.mt-15(label-width="120px", ref="loginForm", :model="obj", :rules="rules")
      el-form-item(label="用户名", prop="username")
        el-input.max-w-80(placeholder="请输入用户名", size="medium", v-model="obj.username")
      el-form-item(label="密码", prop="pwd")
        el-input.max-w-80(placeholder="请输入密码", type="password", size="medium", v-model="obj.pwd", @keyup.enter.native="subform('loginForm')")
      .text-center.mt-10
        el-button.login-btn(type="primary", size="medium", @click="subform('loginForm')") 登录


</template>

<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      obj: {
        username: '',
        pwd: ''
      },
      rules: {
        username: [{ required: true, message: '不能为空', trigger: 'blur' }],
        pwd: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    ...mapActions(['setUser']),
    async subform(formName) {
      try {
        const data = await this.formValidate(this, formName)
        console.log('data:>.', data)
        if (data === 'success') this.callLogin()
      } catch (e) {
        console.error(e)
      }
    },
    async callLogin() {
      try {
        this.pageShow(this)
        const { data } = await this.apiStreamPost(
          '/proxy/login',
          { username: this.obj.username.trim(), pwd: this.obj.pwd.trim() },
          'post'
        )
        this.pageHide(this)
        console.log(data)
        if (data.return_code === 0) {
          this.setUser(data.user)
          this.jump('/')
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

<style lang="stylus" scoped>
.max-w-80 {
  max-width: 80%;
}

.login-container {
  background-color: #373d41;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  margin: 0 auto;
  padding-top: calc(((100vh - 260px) / 2));

  .form {
    width: 440px;
    height: 260px;
    background: #fff;
    border-radius: 12px;
    padding: 20px 10px;
    margin: 0 auto;

    .title {
      font-size: 24px;
      text-align: center;
      font-weight: bold;
    }
  }

  .login-btn {
    width: 56%;
    background: #373d41;
    border-raduis: 2px;
    border: 0px;
    letter-spacing: 1px;
  }
}
</style>
