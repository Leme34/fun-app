<template>
  <div class="register-wrap" @click="handleBlur">
    <Header title="注册" />
    <el-form :model="form" class="form-box" :class="{shake: isError}">
      <el-form-item>
        <avatar :url="form.avatarUrl" @getAvatar="getAvatar"></avatar>
      </el-form-item>
      <div class="input-box">
        <i class="iconfont icon-myfill"></i>
        <input
          class="input"
          type="text"
          v-model.trim="form.username"
          placeholder="请输入用户名"
          @click.stop
        />
      </div>
      <div class="input-box">
        <i class="iconfont icon-commandfill"></i>
        <input
          class="input"
          type="password"
          v-model.trim="form.password"
          placeholder="请输入密码"
          @click.stop
        />
      </div>
      <div class="input-box">
        <i class="iconfont icon-youxiang"></i>
        <input class="input" type="text" v-model.trim="form.email" placeholder="请输入邮箱" @click.stop />
      </div>
      <div class="input-box">
        <i class="iconfont icon-yanzhengma1"></i>
        <input
          class="captcha-input"
          type="text"
          v-model.trim="form.captcha"
          placeholder="请输入验证码"
          @click.stop
        />
        <el-button
          class="captcha-send"
          icon="el-icon-s-promotion"
          @click="send"
          type="success"
          :disabled="(disabled = !show)"
        >
          <span v-show="show">获取验证码</span>
          <span v-show="!show" class="count">{{ count }}</span>
        </el-button>
      </div>
      <div class="btn-login" @click="handleRegister">注册</div>
    </el-form>
  </div>
</template>

<script>
import Avatar from '@/components/avatar';
export default {
  name: 'Register',
  components: { Avatar },
  data() {
    return {
      form: {
        username: '',
        password: '',
        avatar: null,
        avatarUrl: `${process.env.BASE_URL}avatar_default.svg`,
        captcha: null,
        email: null
      },
      isAjax: false,
      isError: false,
      show: true, // 初始启用按钮
      count: '', // 初始化次数
      timer: null
    };
  },
  methods: {
    handleBlur() {
      let aInput = document.querySelectorAll('.input');
      aInput.forEach(item => item.blur());
      // 解决苹果手机表单页面无法复原问题
      window.scroll(0, 0);
    },
    getAvatar(avatar) {
      console.log(avatar);

      this.form.avatar = avatar.id;
      this.form.avatarUrl = avatar.url;
    },
    async send() {
      const TIME_COUNT = 60; // 倒计时时间
      if (!this.timer) {
        // 可发送状态
        this.$http
          .httpGet('/app/send-email', {
            username: this.form.username,
            email: this.form.email
          })
          .then(res => {
            if (res.code === 0) {
              // 发送成功
              this.count = TIME_COUNT;
              this.show = false;
              this.timer = setInterval(() => {
                // 倒计时
                if (this.count > 0 && this.count <= TIME_COUNT) {
                  this.count--;
                } else {
                  // 倒计时完成，重置按钮
                  this.show = true;
                  clearInterval(this.timer); // 清除定时器
                  this.timer = null;
                }
              }, 1000);
            } else {
              // 处理发送短信请求返回的错误
              this.isError = true;
              this.$toast({
                msg: res.msg,
                callback: () => (this.isError = false)
              });
            }
          })
          .catch(() => {
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
        }); ;
      }
    },
    handleRegister() {
      this.$http
        .httpPost('/app/register', {
          avatar: this.form.avatar,
          username: this.form.username,
          password: this.form.password,
          email: this.form.email,
          captcha: this.form.captcha
        })
        .then(res => {
          if (res.code === 0) {
            this.$message({
              showClose: true,
              message: '注册成功',
              type: 'success'
            });
            this.$router.replace({ path: '/login' });
          } else {
            this.isError = true;
            this.$toast({
              msg: res.msg,
              callback: () => (this.isError = false)
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
        }); ;
    },
    handleUploadSuccess(res) {
      if (res.code === 0 && res.msg === 'success') {
        this.$message({
          showClose: true,
          message: '上传成功',
          type: 'success',
          onClose: () => {
            this.form.avatar = res.data.id;
            this.form.avatarUrl = res.data.path;
          }
        });
      } else {
        this.$message({
          showClose: true,
          message: res.msg,
          type: 'error'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.register-wrap {
  height: 100vh;
  font-size: 14px;
  color: $fs333;

  .form-box {
    @include fcol(flex-start);
    padding: 30px 0 20px;

    &.shake {
      animation: ani-shake 0.5s;
    }

    .avatar-box {
      width: 60px;
      height: 60px;
      padding: 5px;
      border: 1px solid $bdeee;
      border-radius: 50%;

      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }

    .name {
      margin-top: 10px;
    }

    .input-box {
      @include frow(flex-start);
      width: 220px;
      height: 40px;
      margin-top: 20px;
      border: 1px solid $bdeee;
      border-radius: 50px;
      overflow: hidden;

      .iconfont {
        margin-left: 10px;
        font-size: 18px;
      }

      .input {
        @include frow(flex-start);
        flex: 1;
        height: 100%;
        padding: 0 10px;
        overflow: hidden;
      }
    }

    .btn-login {
      @include frow();
      width: 220px;
      height: 42px;
      margin-top: 20px;
      color: $fswhite;
      border-radius: 50px;
      background: $bgf33;
    }
  }

  .captcha-input {
    width: 60%;
  }

  .captcha-send {
    width: 50%;
    line-height: 14px;
    text-align: center;
    font-size: 8px;
    border-radius: 50px;
  }

  .loading-box {
    @include frow();
    height: 100px;
  }
}

@keyframes ani-shake {
  0%,
  40%,
  80% {
    transform: translate3d(-10px, 0, 0);
  }
  20%,
  60%,
  100% {
    transform: translate3d(10px, 0, 0);
  }
}
</style>
