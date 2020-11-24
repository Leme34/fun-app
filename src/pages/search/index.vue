<template>
  <div class="search-wrap">
    <div class="header-bar">
      <span class="btn-back" @click="$router.back()">
        <i class="iconfont icon-fanhui"></i>
      </span>
      <div class="search-box">
        <i class="iconfont icon-search"></i>
        <input
          class="search"
          type="text"
          v-model="keyword"
          placeholder="请输入关键字"
          @keyup.enter="reload"
        />
        <el-autocomplete
          class="search-box-el"
          v-model="keyword"
          :fetch-suggestions="autocomplete"
          placeholder="请输入关键字"
          :trigger-on-focus="false"
           @keyup.enter.native="handleSearch($event)"
        ></el-autocomplete>
      </div>
      <span class="btn-search" @click="reload">搜索</span>
    </div>
    <el-collapse>
      <el-collapse-item title="分类过滤" name="分类过滤">
        <el-radio-group v-model="categoryId" size="small" @change="reload">
          <el-radio-button v-for="item in category" :label="item.id" :key="item.id">{{item.name}}</el-radio-button>
        </el-radio-group>
      </el-collapse-item>
      <el-collapse-item title="排序规则" name="排序规则">
        <el-radio-group v-model="shopPage.order_field" size="small" @change="reload">
          <el-radio-button
            v-for="item in sortOptions"
            :label="item.value"
            :key="item.value"
          >{{item.label}}</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="shopPage.order" size="small" @change="reload">
          <el-radio-button label="asc" :disabled="shopPage.order_field===''">
            <i class="el-icon-top"></i>
          </el-radio-button>
          <el-radio-button label="desc" :disabled="shopPage.order_field===''">
            <i class="el-icon-bottom"></i>
          </el-radio-button>
        </el-radio-group>
        <el-switch
          style="display: block;margin-top:10px;margin-left:24px"
          v-model="isStrict"
          active-color="#13ce66"
          inactive-color="#ff4949"
          inactive-text="精确搜索"
          inactive-value="1"
          active-text="模糊搜索"
          active-value="0"
          @change="reload"
        ></el-switch>
      </el-collapse-item>
      <el-collapse-item title="标签筛选" name="标签筛选" :disabled="tagsOptions.length==0">
        <el-checkbox-group size="small" v-model="tags" @change="reload">
          <el-checkbox-button
            v-for="item in tagsOptions"
            :label="item.tags"
            :key="item.tags"
          >{{item.tags}}{{tags.indexOf(item.tags)=='-1'?item.num:''}}</el-checkbox-button>
        </el-checkbox-group>
      </el-collapse-item>
    </el-collapse>
    <template v-if="isLoading&&this.shopPage.start===1">
      <div class="hint">玩命加载中，请稍候</div>
      <Loading></Loading>
    </template>
    <!-- 主体部分 -->
    <template v-else>
      <Scroll
        class="shop-scroll"
        :data="shopPage.list"
        :isHasMore="shopPage.more"
        pullUpLoad
        v-if="shopPage.list.length"
        @emitLoad="loadMore"
      >
        <div class="hot-box">
          <Item :list="shopPage.list" isHome></Item>
        </div>
      </Scroll>
      <div class="hint" v-else>没有找到匹配的商品</div>
    </template>
  </div>
</template>

<script>
import { Item, Loading } from '@/components';

export default {
  name: 'Search',
  components: { Item, Loading },
  data() {
    return {
      keyword: '',
      list: [],
      isLoading: false,
      shopPage: {
        // 商铺列表分页参数
        list: [],
        start: 1, // 起始位置
        order_field: '',
        order: 'asc',
        more: true
      },
      sortOptions: [
        {
          label: '价格',
          value: 'price_per_man'
        },
        {
          label: '距离',
          value: 'distance'
        },
        {
          label: '默认',
          value: ''
        }
      ],
      category: [
        {
          id: null,
          name: '全部'
        }
      ],
      tags: [], // 多选框组件需要绑定的tags
      tagsOptions: [], // 可选的tags
      categoryId: '',
      isStrict: 1 // 默认精准搜索模式
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      // 保证已经定位
      if (!this.$store.state.userLocation) {
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
      // 加载分类
      this.$http
        .httpGet('/app/category/listAll')
        .then(res => {
          if (res.code === 0) {
            this.category = [{ id: null, name: '全部' }, ...res.data];
          } else {
            this.$message({
              showClose: true,
              message: '分类加载失败,原因:' + res.msg,
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
      // TODO 加载热搜词
    },
    load() {
      let word = this.keyword.trim();
      if (!word) {
        return this.$toast({ msg: '关键字不能为空' });
      }
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;

      // tags数组转为空格分隔的字符串
      let tagsStr = '';
      this.tags.forEach(tag => {
        tagsStr = tagsStr.concat(tag + ' ');
      });
      tagsStr = tagsStr.trim();

      this.$http
        .httpGet('/app/shop/search', {
          lng: this.$store.state.userLocation.lng,
          lat: this.$store.state.userLocation.lat,
          keyword: this.keyword,
          categoryId: this.categoryId,
          tags: tagsStr,
          isStrict: this.isStrict,
          page: this.shopPage.start,
          limit: 10,
          order_field: this.shopPage.order_field,
          order: this.shopPage.order
        })
        .then(res => {
          this.isLoading = false;
          if (res.code === 0) {
            this.shopPage.list = [...this.shopPage.list, ...res.data.shopList];
            this.shopPage.start = this.shopPage.list.length + 1; // 起始位置+1
            this.shopPage.more = res.more;
            this.tagsOptions = res.data.tagsAggs;
          } else {
            this.$message({
              showClose: true,
              message: '搜索失败,原因:' + res.msg,
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
    // 先初始化分页数据再搜索
    reload() {
      this.shopPage = {
        // 房源列表分页参数
        list: [],
        start: 1, // 起始位置
        order_field: this.shopPage.order_field, // 保留之前用户选择的排序方式
        order: this.shopPage.order, // 保留之前用户选择的排序方式
        more: true
      };
      this.load();
    },
    handleSearch(e) {
      let word = this.keyword.trim();
      if (!word) {
        return this.$toast({ msg: '关键字不能为空' });
      }
      this.$router.replace({
        name: 'search',
        query: { word, time: +new Date() }
      });
    },
    autocomplete(queryString, cb) {
      // 请求自动补全
      this.$http
        .httpGet('/app/shop/search-as-you-type', {
          prefix: this.keyword
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
  },
  watch: {
    $route: {
      handler(val) {
        // 重置data数据
        Object.assign(this.$data, this.$options.data(), {
          keyword: val.query.word,
          // 重置分页数据
          shopPage: {
            // 房源列表分页参数
            list: [],
            start: 1, // 起始位置
            order_field: this.shopPage.order_field, // 保留之前用户选择的排序方式
            order: this.shopPage.order, // 保留之前用户选择的排序方式
            more: true
          },
          category: [],
          tags: [],
          categoryId: ''
        });
        this.load();
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="scss" scoped>
.search-wrap {
  display: flex;
  flex-direction: column;

  height: 100vh;
  font-size: 14px;
  color: $fs333;

  .header-bar {
    @include frow(space-between);
    flex: 0 0 50px;
    font-size: 16px;
    color: $fswhite;
    background: $bgf33;
    .btn-back {
      @include frow();
      width: 55px;
      height: 100%;
      .iconfont {
        font-size: 20px;
      }
    }
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
            height: 30px;
            border: none;
          }
        }
      }
    }
    .btn-search {
      @include frow();
      width: 65px;
      height: 100%;
      &:active {
        opacity: 0.8;
      }
    }
  }
  .hint {
    @include frow();
    height: 100px;
  }

  .el-checkbox-group,
  .el-radio-group {
    margin-left: 24px;
  }

  .shop-scroll {
    position: inherit;
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
}
</style>
