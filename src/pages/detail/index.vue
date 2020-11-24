<template>
  <div class="detail-wrap">
    <Header title="商品详情"></Header>
    <template v-if="isLoading">
      <div class="loading-box">加载中...</div>
      <Loading></Loading>
    </template>
    <!-- 主体内容 -->
    <template v-else>
      <div class="goods-box">
        <div class="img-box">
          <img class="img" :src="goods.coverUrl" :alt="goods.title" />
        </div>
        <div class="intr-box">
          <el-popover placement="top-start" width="200" trigger="click" :content="goods.title">
            <h2 class="name" slot="reference">{{goods.title|ellipsis(30)}}</h2>
          </el-popover>
          <div class="other-box">
            <Star :score="goods.remarkScore"></Star>
            <!-- <span class="text">{{goods.comments.length + '条'}}</span> -->
            <span class="text">{{'￥'+ goods.pricePerMan + '/份'}}</span>
          </div>
          <div class="score-box">
            <el-popover
              placement="top-start"
              width="200"
              trigger="click"
              :content="goods.description"
            >
              <div class="store-name" slot="reference">{{goods.description|ellipsis(34)}}</div>
            </el-popover>
            <!-- <span class="text">{{'口味:' + goods.store.taste}}</span>
              <span class="text">{{'环境:' + goods.store.environment}}</span>
            <span class="text">{{'服务:' + goods.store.service}}</span>-->
          </div>
        </div>
      </div>

      <!-- 店铺信息 -->
      <ul class="store-box">
        <li class="item-box">
          <i class="iconfont icon-icon_gps"></i>
          <span class="text">{{goods.province}}{{goods.city}}{{goods.region}}{{goods.address}}</span>
        </li>
        <!-- <li class="item-box">
            <i class="iconfont icon-time" />
            <span class="text">{{'营业时间' + goods.store.businessHours}}</span>
          </li>
          <li class="item-box">
            <i class="iconfont icon-icon" />
            <span class="text">{{goods.store.tel}}</span>
        </li>-->
      </ul>
      <baidu-map
        ak="***"
        class="map"
        :style="{width:map.width,height:map.height}"
        :zoom="map.zoom"
        :center="{lng: map.center.lng, lat: map.center.lat}"
        :scroll-wheel-zoom="true"
        @ready="ready"
        ref="map"
      ></baidu-map>
      <div>
        <el-input
          placeholder="来都来了，说点什么呗~"
          v-model="commentForm.content"
          class="comment_input"
          @keyup.enter.native="commit"
        >
          <el-tag
            v-if="commentForm.replyComment.username"
            slot="prepend"
            closable
            :disable-transitions="false"
            @close="commentForm.replyComment={id:null,userId:null,username:null};"
          >@{{commentForm.replyComment.username}}</el-tag>
          <el-button slot="append" type="success" icon="el-icon-s-promotion" plain @click="commit"></el-button>
        </el-input>
      </div>
      <!-- 商品评论 -->
      <Scroll
        style="top:440px;"
        :data="commentPage.list"
        isBottom
        :isHasMore="commentPage.more"
        pullUpLoad
        @emitLoad="loadMoreComment"
      >
        <ul class="comments-list">
          <div v-if="commentPage.list.length">
            <li class="title-box">
              <span class="title">{{'网友点评'+ commentPage.list.length +'条'}}</span>
              <!-- <span class="btn-view">
                <span>查看全部</span>
                <i class="iconfont icon-youjiantou"></i>
              </span>-->
            </li>
            <li class="item-box" v-for="(item) in commentPage.list" :key="item.id">
              <div class="avatar-box" @click="reply(item,item.id)">
                <img class="avatar" :src="item.userAvatar" :alt="item.userName" />
              </div>
              <div class="content-box">
                <div class="username_operation">
                  <span class="username">{{item.userName}}</span>
                  <i
                    class="iconfont icon-shanchu operation"
                    v-if="item.mine"
                    @click="deleteComment(item.id)"
                  ></i>
                  <i
                    :class="`iconfont ${item.voted?'icon-dianzan1':'icon-dianzan'} operation`"
                    @click="vote(item)"
                  ></i>
                </div>
                <!-- <div class="star-box">
                  <Star :score="item.star"></Star>
                </div>-->
                <p class="text" style="margin-top:2px">{{item.content}}</p>
                <div class="createdAt" style="margin-top:2px">{{item.createdAt}}</div>
                <!-- <div class="pic-bar" >
                  <ul class="pic-list">
                    <li class="pic-box" v-for="(_item, _index) in item.pics" :key="_index">
                      <img class="pic" :src="_item" alt />
                    </li>
                  </ul>
                </div>-->
                <!-- 子评论 -->
                <li class="item-box" v-for="(subItem) in item.commentList" :key="subItem.id">
                  <div class="avatar-box" @click="reply(subItem,item.id)">
                    <img class="avatar" :src="subItem.userAvatar" :alt="subItem.userName" />
                  </div>
                  <div class="content-box">
                    <div class="username_operation">
                      <span
                        v-if="subItem.replyUserId"
                        class="username"
                      >{{subItem.userName}} 回复 {{subItem.replyUserName}}</span>
                      <span v-else class="username">{{subItem.userName}}</span>
                      <i
                        class="iconfont icon-shanchu operation"
                        v-if="subItem.mine"
                        @click="deleteComment(subItem.id)"
                      ></i>
                      <i
                        :class="`iconfont ${subItem.voted?'icon-dianzan1':'icon-dianzan'} operation`"
                        @click="vote(subItem)"
                      ></i>
                    </div>
                    <p class="text" style="margin-top:2px">{{subItem.content}}</p>
                    <div class="createdAt" style="margin-top:2px">{{subItem.createdAt}}</div>
                  </div>
                </li>
              </div>
            </li>
          </div>
          <div v-else>
            <li class="no-comments">此商品暂无评论</li>
          </div>
        </ul>
      </Scroll>
      <!-- 底部操作 -->
      <div class="handle-bar">
        <div
          class="btn btn-star"
          :class="{active: _isCollect}"
          @click="handleToggleCollect"
        >{{_isCollect ? '取消收藏' : '加入收藏'}}</div>
        <div class="btn btn-cart" @click="handleCart(false)">加入购物车</div>
        <div class="btn btn-buy" @click="handleCart(true)">立即购买</div>
      </div>
    </template>
  </div>
</template>

<script>
import { Star, Loading } from '@/components';
import { BaiduMap } from 'vue-baidu-map';
export default {
  name: 'Detail',
  components: { Star, Loading, BaiduMap },
  filters: {
    ellipsis(value, size) {
      if (!value) return '';
      if (value.length > size) {
        return value.slice(0, size) + '...';
      }
      return value;
    }
  },
  data() {
    return {
      id: 0,
      goods: {
        store: {}
      },
      commentPage: {
        list: [],
        start: 1, // 起始位置
        more: true
      },
      isLoading: false,
      map: {
        center: { lng: 113.3, lat: 22.8 }, // '顺德',
        zoom: 10,
        width: '375px',
        height: '200px'
      },
      commentForm: {
        content: '',
        replyComment: {
          id: null,
          userId: null,
          username: ''
        }
      }
    };
  },
  computed: {
    _isCollect() {
      if (this.$store.state.isLogin === 0) {
        return false;
      }
      return !!this.$store.state.collectList.find(item => item.id === this.id);
    }
  },
  methods: {
    handleCart(isNowBuy) {
      if (isNowBuy) {
        // 添加到购物车
        this.$http
          .httpPost('app/cart/save', {
            goodsId: this.goods.id,
            amount: 1,
            name: this.goods.title,
            imageUrl: this.goods.coverUrl,
            price: this.goods.pricePerMan
          })
          .then(res => {
            if (res.code === 0) {
            } else {
              this.$message({
                showClose: true,
                message: '请求失败,原因:' + res.msg,
                type: 'error'
              });
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: '服务器错误'
            });
          });
        // 选中购物车的该商品
        this.$store.commit('$checkedGoods', [
          {
            amount: 1,
            price: this.goods.pricePerMan,
            goodsId: this.goods.id,
            name: this.goods.title
          }
        ]);
        this.$router.push({ name: 'payment', params: { from: 'detail' } });
      } else {
        this.$http
          .httpPost('app/cart/save', {
            goodsId: this.goods.id,
            amount: 1,
            name: this.goods.title,
            imageUrl: this.goods.coverUrl,
            price: this.goods.pricePerMan
          })
          .then(res => {
            if (res.code === 0) {
              this.$toast({ msg: '加入购物车成功', duration: 5e2 });
            } else {
              this.$message({
                showClose: true,
                message: '请求失败,原因:' + res.msg,
                type: 'error'
              });
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: '服务器错误'
            });
          });
      }
    },
    handleToggleCollect() {
      if (this.$store.state.isLogin === 0) {
        return this.$router.replace({
          name: 'login',
          query: { redirect: this.$route.path }
        });
      }
      this.$store.commit('$handleCollect', this.goods);
    },
    ready({ BMap, map }) {
      map.addOverlay(
        new BMap.Marker(new BMap.Point(this.goods.lng, this.goods.lat))
      );
    },
    async load() {
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      await this.$http
        .httpGet(`/app/shop/${this.id}`)
        .then(res => {
          this.isLoading = false;
          if (res.code === 0) {
            this.goods = res.data;
            this.map.center.lng = this.goods.lng;
            this.map.center.lat = this.goods.lat;
            this.map.zoom = 18;
          } else {
            this.$message({
              showClose: true,
              message: '请求失败,原因:' + res.msg,
              type: 'error'
            });
          }
        })
        .catch(() => {
          this.isLoading = false;
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
        });
      // 加载评论
      this.loadComment();
    },
    loadComment() {
      this.$http
        .httpGet('/app/comment/page', {
          shopId: this.id
        })
        .then(res => {
          if (res.code === 0) {
            this.commentPage.list = [
              ...this.commentPage.list,
              ...res.data.list
            ];
            this.commentPage.more = res.more;
          } else {
            this.$message({
              showClose: true,
              message: '评论加载失败,原因:' + res.msg,
              type: 'error'
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
        });
    },
    loadMoreComment() {
      if (!this.commentPage.more) {
        return;
      }
      // 解决better-scroll的pullingUp事件重复触发问题
      if (this.commentPage.start === 1) {
        return;
      }
      this.loadComment();
    },
    commit() {
      this.$http
        .httpPost('/app/comment', {
          content: this.commentForm.content,
          pid: this.commentForm.replyComment.id,
          replyUserId: this.commentForm.replyComment.userId,
          shopId: this.id
        })
        .then(res => {
          if (res.code === 0) {
            this.$toast({ msg: '发表成功', duration: 5e2 });
            this.commentForm = {
              content: '',
              replyComment: {
                id: null,
                userId: null,
                username: null
              }
            };
            this.reloadComment();
          } else if (res.code === 401) {
            this.$toast({ msg: '请先登录', duration: 5e2 });
            this.$router.push({ name: 'login', params: { from: 'detail' } });
          } else {
            this.$message({
              showClose: true,
              message: '评论加载失败,原因:' + res.msg,
              type: 'error'
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
        });
    },
    reloadComment() {
      this.commentPage = {
        list: [],
        start: 1, // 起始位置
        more: true
      };
      this.loadComment();
    },
    vote(comment) {
      if (comment.voted) {
        this.$http
          .httpDelete(`/app/vote/${comment.id}`)
          .then(res => {
            if (res.code === 0) {
              this.reloadComment();
            } else if (res.code === 401) {
              this.$toast({ msg: '请先登录', duration: 5e2 });
              this.$router.push({ name: 'login', params: { from: 'detail' } });
            } else {
              this.$message({
                showClose: true,
                message: '操作失败,原因:' + res.msg,
                type: 'error'
              });
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: '服务器错误'
            });
          });
      } else {
        this.$http
          .httpPost(`/app/vote/${comment.id}`)
          .then(res => {
            if (res.code === 0) {
              this.reloadComment();
            } else if (res.code === 401) {
              this.$toast({ msg: '请先登录', duration: 5e2 });
              this.$router.push({ name: 'login', params: { from: 'detail' } });
            } else {
              this.$message({
                showClose: true,
                message: '操作失败,原因:' + res.msg,
                type: 'error'
              });
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: '服务器错误'
            });
          });
      }
    },
    deleteComment(commentId) {
      this.$confirm({
        msg: '确定删除该评论吗？',
        confirm: () => {
          this.$http
            .httpDelete(`/app/comment/${commentId}`)
            .then(res => {
              if (res.code === 0) {
                this.$toast({ msg: '操作成功', duration: 5e2 });
                this.reloadComment();
              } else if (res.code === 401) {
                this.$toast({ msg: '请先登录', duration: 5e2 });
                this.$router.push({
                  name: 'login',
                  params: { from: 'detail' }
                });
              } else {
                this.$message({
                  showClose: true,
                  message: '操作失败,原因:' + res.msg,
                  type: 'error'
                });
              }
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '服务器错误'
              });
            });
        }
      });
    },
    reply(comment, pid) {
      // 二级子评论才要被回复者id
      if (comment.pid) {
        this.commentForm.replyComment.userId = comment.userId;
      }
      this.commentForm.replyComment.username = comment.userName;
      this.commentForm.replyComment.id = pid; // pid
      console.log(this.commentForm);
    }
  },
  watch: {
    $route: {
      handler(val) {
        Object.assign(this.$data, this.$options.data());
        // +的作用是隐式转化
        this.id = +val.params.id;
        this.load();
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="scss" scoped>
.detail-wrap {
  height: 100vh;
  font-size: 14px;
  color: $fs333;
  .loading-box {
    @include frow();
    height: 100px;
  }
  .goods-box {
    display: flex;
    padding: 15px;
    box-sizing: border-box;
    .img-box {
      width: 116px;
      height: 87px;
      .img {
        width: 100%;
        height: 100%;
      }
    }
    .intr-box {
      flex: 1;
      padding-left: 15px;
      font-size: 12px;
      color: $fs999;
      .name {
        font-size: 14px;
        color: $fs333;
      }
      .other-box,
      .store-name,
      .score-box {
        @include frow(flex-start);
        margin-top: 5px;
        .text {
          margin-left: 15px;
        }
      }
      .score-box {
        .text {
          margin: 0 5px 0 0;
        }
      }
    }
  }
  .store-box {
    .item-box {
      @include frow(flex-start);
      height: 35px;
      margin: 0 15px;
      border-top: 1px solid $bdeee;
      .iconfont {
        color: $fs999;
      }
      .text {
        font-size: 12px;
        margin-left: 10px;
      }
    }
  }
  .comment_input {
    ::v-deep .el-input-group__prepend {
      padding: 0;
    }
  }
  .comments-list {
    font-size: 12px;
    .title-box,
    .no-comments {
      @include frow(space-between);
      height: 40px;
      padding: 0 15px;
      background: $bgeee;
    }
    .no-comments {
      justify-content: center;
    }
    .item-box {
      display: flex;
      margin: 0 15px;
      padding: 15px 0;
      &:nth-of-type(n + 3) {
        border-top: 1px solid $bdeee;
      }
      .avatar-box {
        width: 35px;
        height: 35px;
        border: 1px solid $bdeee;
        border-radius: 50%;
        overflow: hidden;
        background: url(./img/avatar.png) no-repeat center;
        background-size: contain;
        .avatar {
          width: 100%;
          height: 100%;
        }
      }
      .content-box {
        flex: 1;
        padding-left: 15px;
        overflow: hidden;
        .star-box,
        .text,
        .pic-bar {
          margin-top: 10px;
        }
        .text {
          line-height: 1.5;
        }
        .pic-bar {
          overflow: hidden;
          .pic-list {
            display: inline-table;
            white-space: nowrap;
            .pic-box {
              display: inline-table;
              width: 80px;
              height: 80px;
              &:nth-of-type(n + 2) {
                margin-left: 15px;
              }
              .pic {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
        .username_operation {
          height: 15px;
        }
        .operation {
          float: right;
          margin-left: 12px;
        }
      }
    }
  }
  .handle-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    @include frow(flex-start);
    height: 50px;
    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      border-top: 1px solid $bdeee;
    }
    .btn {
      @include frow();
      flex: 1;
      height: 100%;
      &.active {
        color: $fswhite;
        background: $bgf33;
      }
      &:nth-of-type(n + 2) {
        border-left: 1px solid $bdeee;
      }
    }
    .btn-cart {
      color: $bgwhite;
      background: $bgf33;
    }
    .btn-buy {
      color: $bgwhite;
      background: $bgdf2;
    }
  }
}
</style>
