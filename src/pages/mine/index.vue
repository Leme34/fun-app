<template>
  <div class="mine-wrap">
    <Header title="个人中心"></Header>
    <div class="user-box">
      <avatar :url="form.avatarUrl" @getAvatar="getAvatar"></avatar>
      <div class="name">{{form.username}}</div>
      <div class="btn-logout" @click="handleLogout">退出</div>
    </div>
  </div>
</template>

<script>
import Avatar from '@/components/avatar';
export default {
  name: 'Mine',
  components: { Avatar },
  mounted() {
    this.getData();
  },
  data() {
    return {
      form: {
        username: '',
        avatarUrl: `${process.env.BASE_URL}avatar_default.svg`
      }
    };
  },
  methods: {
    getData() {
      this.$http.httpGet('/app/member').then(res => {
        if (res.code === 0) {
          this.form.username = res.data.username;
          if (res.data.avatarUrl) {
            this.form.avatarUrl = res.data.avatarUrl;
          }
        } else {
          this.$message({
            showClose: true,
            message: res.msg,
            type: 'error'
          });
          this.$router.replace({ path: '/login' });
        }
      });
    },
    getAvatar(avatar) {
      // 更新刚刚上传成功的头像
      this.$http
        .httpPut('/app/member', {
          avatar: avatar.id,
          phone: null,
          email: null,
          sex: null,
          birth: null
        })
        .then(res => {
          if (res.code === 0) {
            this.$message({
              showClose: true,
              message: '保存成功',
              type: 'success'
            });
            this.getData();
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
    handleLogout() {
      this.$confirm({
        msg: '你确定要退出登录吗？',
        confirm: () => {
          this.$store.commit('$handleLogin', { isLogin: 0, token: {} });
          this.$router.push({ name: 'home' });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.mine-wrap {
  height: 100vh;
  font-size: 14px;
  color: $fs333;
  .user-box {
    @include fcol(flex-start);
    padding: 30px 0 20px;
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
      @include frow();
      margin-top: 10px;
    }
    .btn-logout {
      @include frow();
      width: 120px;
      height: 42px;
      margin-top: 20px;
      color: $fswhite;
      border-radius: 50px;
      background: $bgf33;
    }
  }
}
</style>
