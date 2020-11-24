<template>
  <div class="avatar">
    <el-upload
      class="avatar-box"
      :accept="'image/*'"
      :action="uploadUrl"
      :show-file-list="false"
      :on-success="handleUploadSuccess"
    >
      <img class="avatar" :src="this.url" width="60" height="60" alt="头像" />
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'Avatar',
  inheritAttrs: false,
  props: {
    url: String
  },
  data() {
    return {
      avatar: {
        id: '',
        url: ''
      }
    };
  },
  computed: {
    uploadUrl() {
      return `${
        process.env.NODE_ENV === 'development' ? '/api' : '/fun'
      }/cos/save?fileType=1`;
    }
  },
  methods: {
    handleUploadSuccess(res) {
      if (res.code === 0 && res.msg === 'success') {
        this.$message({
          showClose: true,
          message: '上传成功',
          type: 'success',
          onClose: () => {
            this.avatar.id = res.data.id;
            this.avatar.url = res.data.path;
            this.$emit('getAvatar', this.avatar);
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
.avatar-box {
  width: 60px;
  height: 60px;
  padding: 5px;
  border: 1px solid $bdeee;
  border-radius: 50%;

  .avatar {
    width: 100%;
    border-radius: 50%;
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
</style>
