<template>
  <div class="home-wrap">
    <div class="header-bar">
      <span class="text-box" @click="$router.push({name: 'address'})">
        <span>{{nowAddress}}</span>
        <i class="iconfont icon-icon-downarrow"></i>
      </span>
      <div class="search-box">
        <i class="iconfont icon-search"></i>
        <input
          class="search"
          type="text"
          v-model="form.keyword"
          placeholder="请输入关键字"
          @keyup="handleSearch($event)"
        />
        <el-autocomplete
          class="search-box-el"
          v-model="form.keyword"
          :fetch-suggestions="autocomplete"
          placeholder="请输入关键字"
          :trigger-on-focus="false"
          @keyup.enter.native="handleSearch($event)"
        ></el-autocomplete>
      </div>
      <span class="btn-search" @click="$router.push({name: isLogin ? 'collect' : 'login'})">
        <i :class="['iconfont', isLogin ? 'icon-iconstar' : 'icon-myfill']"></i>
      </span>
    </div>
    <Scroll
      isBottom
      pullUpLoad
      :data="shopPage.list"
      :isHasMore="shopPage.more"
      @emitLoad="loadMore"
      ref="scrollRef"
    >
      <!-- 轮播图 -->
      <Slider>
        <div class="slider-box" v-for="(item, index) in nav.menus" :key="index">
          <div class="item-list">
            <div class="item-box" v-for="(_item, _index) in item" :key="_index">
              <div class="img-box">
                <img class="img" :src="_item.imgUrl" :alt="_item.text" />
              </div>
              <div class="text">{{_item.text}}</div>
            </div>
          </div>
        </div>
      </Slider>
      <!-- 超值特惠 -->
      <div class="boon-box">
        <h2 class="title">超值特惠</h2>
        <div class="list-box">
          <div
            class="item-box"
            v-for="(item, index) in nav.boons"
            :key="index"
            @click="handlerBoon(item)"
          >
            <div class="caption" :style="item.color">{{item.title}}</div>
            <div class="sub-caption">{{item.subTitle}}</div>
            <div class="img-box">
              <img class="img" :src="item.imgUrl" :alt="item.title" />
            </div>
          </div>
        </div>
      </div>
      <!-- 热门商品 -->
      <div class="hot-box">
        <h2 class="title">热门商品</h2>
        <Item :list="shopPage.list" isHome></Item>
      </div>
    </Scroll>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Slider, Item, Loading } from '@/components';

export default {
  name: 'Home',
  components: { Slider, Item, Loading },
  data() {
    return {
      nav: {
        menus: [
          [
            {
              imgUrl: require('./img/icon01.png'),
              text: '美食'
            },
            {
              imgUrl: require('./img/icon01.png'),
              text: '电影'
            },
            {
              imgUrl: require('./img/icon03.png'),
              text: '酒店'
            },
            {
              imgUrl: require('./img/icon04.png'),
              text: '休闲娱乐'
            },
            {
              imgUrl: require('./img/icon05.png'),
              text: '外卖'
            },
            {
              imgUrl: require('./img/icon06.png'),
              text: '火锅'
            },
            {
              imgUrl: require('./img/icon07.png'),
              text: '丽人'
            },
            {
              imgUrl: require('./img/icon08.png'),
              text: '度假出行'
            },
            {
              imgUrl: require('./img/icon09.png'),
              text: '足疗按摩'
            },
            {
              imgUrl: require('./img/icon10.png'),
              text: '周边游'
            }
          ],
          [
            {
              imgUrl: require('./img/icon11.png'),
              text: '景点'
            },
            {
              imgUrl: require('./img/icon12.png'),
              text: 'KTV'
            },
            {
              imgUrl: require('./img/icon13.png'),
              text: '购物'
            },
            {
              imgUrl: require('./img/icon14.png'),
              text: '生活服务'
            },
            {
              imgUrl: require('./img/icon15.png'),
              text: '运动健身'
            },
            {
              imgUrl: require('./img/icon16.png'),
              text: '美发'
            },
            {
              imgUrl: require('./img/icon17.png'),
              text: '亲子'
            },
            {
              imgUrl: require('./img/icon18.png'),
              text: '小吃快餐'
            },
            {
              imgUrl: require('./img/icon19.png'),
              text: '自助餐'
            },
            {
              imgUrl: require('./img/icon20.png'),
              text: '酒吧'
            }
          ],
          [
            {
              imgUrl: require('./img/icon21.png'),
              text: '日本菜'
            },
            {
              imgUrl: require('./img/icon22.png'),
              text: 'SPA'
            },
            {
              imgUrl: require('./img/icon23.png'),
              text: '结婚'
            },
            {
              imgUrl: require('./img/icon24.png'),
              text: '学习培训'
            },
            {
              imgUrl: require('./img/icon25.png'),
              text: '西餐'
            },
            {
              imgUrl: require('./img/icon26.png'),
              text: '火车机票'
            },
            {
              imgUrl: require('./img/icon27.png'),
              text: '烧烤'
            },
            {
              imgUrl: require('./img/icon28.png'),
              text: '家装'
            },
            {
              imgUrl: require('./img/icon29.png'),
              text: '宠物'
            },
            {
              imgUrl: require('./img/icon30.png'),
              text: '周边游'
            }
          ]
        ],
        boons: [
          {
            id: 1,
            title: '外卖特惠',
            subTitle: '优惠多多 准时到家',
            color: { color: '#c6e34b' },
            imgUrl: require('./img/boon/img01.jpg')
          },
          {
            id: 2,
            title: '周边游',
            subTitle: '马上出发',
            color: { color: '#42d6fe' },
            imgUrl: require('./img/boon/img02.jpg')
          },
          {
            id: 3,
            title: '涨姿势',
            subTitle: '我爱学习 天天向上',
            color: { color: '#fc0' },
            imgUrl: require('./img/boon/img03.jpg')
          },
          {
            id: 4,
            title: '轻住',
            subTitle: '超赞民宿',
            color: { color: '#8c6266' },
            imgUrl: require('./img/boon/img04.jpg')
          },
          {
            id: 5,
            title: '电影',
            subTitle: '1元看大片',
            color: { color: '#fe5e60' },
            imgUrl: require('./img/boon/img05.jpg')
          },
          {
            id: 6,
            title: '休闲生活',
            subTitle: '唱歌按摩',
            color: { color: '#217ecb' },
            imgUrl: require('./img/boon/img06.jpg')
          }
        ]
      },
      form: {
        keyword: ''
      },
      shopPage: {
        // 商铺列表分页参数
        list: [],
        start: 1, // 起始位置
        more: true
      },
      isLoading: false,
      isFirst: true
    };
  },
  computed: mapState(['nowAddress', 'isLogin']),
  activated() {
    if (this.isFirst) {
      this.isFirst = false;
      this.load();
      // 获取用户定位，存入vuex
      let geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(
        r => {
          // 记录用户当前位置
          this.$store.commit('$handleUserLocation', {
            lng: r.point.lng,
            lat: r.point.lat
          });
        },
        { enableHighAccuracy: true }
      );
    }
    // 解决搜索回来页面不能滚动bug
    if (this.$refs.scrollRef) {
      this.$refs.scrollRef.handleRefresh();
    }
    this.reload();
  },
  methods: {
    load() {
      if (this.isLoading || !this.shopPage.more) {
        return;
      }
      this.isLoading = true;
      this.$http
        .httpGet('/app/shop/recommend', {
          lng: this.$store.state.userLocation.lng,
          lat: this.$store.state.userLocation.lat,
          start: this.shopPage.start
        })
        .then(res => {
          this.isLoading = false;
          if (res.code === 0) {
            this.shopPage.list = [...this.shopPage.list, ...res.data.list];
            this.shopPage.start = this.shopPage.list.length + 1; // 起始位置+1
            this.shopPage.more = res.more;
          } else {
            this.$message({
              showClose: true,
              message: '首页推荐加载失败,原因:' + res.msg,
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
    },
    // 先初始化分页数据再搜索
    reload() {
      this.shopPage = {
        // 房源列表分页参数
        list: [],
        start: 1, // 起始位置
        more: true
      };
      this.load();
    },
    loadMore() {
      if (!this.shopPage.more) {
        return;
      }
      // 解决better-scroll的pullingUp事件重复触发问题
      if (this.shopPage.start === 1) {
        return;
      }
      this.load();
    },
    handlerBoon(item) {
      // 找民宿跳转地图组件
      if (item.id === 4) {
        this.$router.push({ name: 'map' });
      }
    },
    handleSearch(e) {
      if (e.keyCode !== 13) {
        return;
      }

      let word = this.form.keyword.trim();

      if (!word) {
        return this.$toast({ msg: '关键字不能为空' });
      }
      this.$router.push({
        name: 'search',
        query: { word, time: +new Date() }
      });
    },
    autocomplete(queryString, cb) {
      // 请求自动补全
      this.$http
        .httpGet('/app/shop/search-as-you-type', {
          prefix: this.form.keyword
        })
        .then(res => {
          if (res.code === 0) {
            // 调用 callback 返回建议列表的数据
            let suggestions = [];
            res.data.forEach(suggestion => {
              suggestions.push({ value: suggestion });
            });
            cb(suggestions);
          } else {
            // this.$message({
            //   showClose: true,
            //   message: '自动补全失败,原因:' + res.msg,
            //   type: 'error'
            // });
          }
        })
        .catch(() => {
          this.$message({
            type: 'error',
            message: '服务器错误'
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.home-wrap {
  height: 100vh;
  .header-bar {
    @include frow(space-between);
    height: 50px;
    font-size: 16px;
    color: $fswhite;
    background: $bgf33;
    .search-box {
      @include frow(flex-start);
      flex: 1;
      height: 30px;
      padding: 0 10px 0 5px;
      border-radius: 50px;
      background: $bgwhite;
      .icon-search {
        font-size: 18px;
        color: $fs999;
      }
      .search {
        display: flex;
        flex: 1;
        padding-left: 5px;
        background: none;
        &::-webkit-input-placeholder {
          color: $fs999;
        }
      }
      .search-box-el {
        position: absolute;
        width: 255px;
        height: 30px;
        ::v-deep .el-input {
          left: 20px;
          top: 0;
          width: 222px;
          height: 30px;
          .el-input__inner {
            width: 200px;
            height: 30px;
            border: none;
          }
        }
      }
    }
    .text-box,
    .btn-search {
      @include frow();
      width: 86px;
      height: 100%;
      &:active {
        opacity: 0.8;
      }
    }
    .text-box {
      .iconfont {
        margin-left: 8px;
        font-size: 18px;
      }
    }
    .btn-search {
      width: 53px;
      .iconfont {
        font-size: 26px;
      }
    }
  }
  .slider-box {
    padding: 25px 15px;
    font-size: 12px;
    .item-list {
      display: flex;
      flex-wrap: wrap;
      .item-box {
        @include fcol();
        width: 20%;
        padding-bottom: 13px;
        .img-box {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: $bgeee;
          .img {
            width: 100%;
            height: 100%;
          }
        }
        .text {
          padding-top: 6px;
        }
      }
    }
  }
  .boon-box {
    .title {
      @include frow();
      height: 40px;
      font-size: 14px;
      color: $fs333;
      background: $bgeee;
    }
    .list-box {
      display: flex;
      flex-wrap: wrap;
      padding: 0 15px;
      border-top: 1px solid $bdeee;
      box-sizing: border-box;
      .item-box {
        @include fcol();
        width: 33.3%;
        height: 130px;
        box-sizing: border-box;
        border-right: 1px solid $bdeee;
        &:nth-of-type(n + 4) {
          border-top: 1px solid $bdeee;
        }
        &:nth-of-type(3n) {
          border-right: 0 none;
        }
        .caption {
          font-size: 14px;
          font-weight: bold;
        }
        .sub-caption {
          font-size: 12px;
          margin-top: 6px;
        }
        .img-box {
          width: 96px;
          height: 67px;
          margin-top: 8px;
          .img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
  .hot-box {
    .title {
      @include frow();
      height: 40px;
      font-size: 14px;
      color: $fs333;
      background: $bgeee;
    }
  }
}
</style>
