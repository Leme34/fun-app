<template>
  <ul class="item-wrap" :class="{padding: isHome}">
    <template v-if="!isCart">
      <li
        class="item-box"
        v-for="(item, index) in list"
        :key="index"
        @click="$router.push({name: 'detail', params: {id: item.id}})"
      >
        <div class="img-box">
          <img class="img" :src="item.coverUrl" alt />
        </div>
        <div class="intr-box" v-if="isHome">
          <div class="top-box">
            <h3 class="name">{{item.title}}</h3>
            <div
              class="distance"
              v-if="item.distance"
            >{{item.distance>1000?Math.floor(item.distance/1000)+'km':item.distance+'m'}}</div>
            <div class="distance" v-else></div>
          </div>
          <div class="desc">{{item.description}}</div>
          <div class="bottom-box">
            <div class="price-box">
              <span class="price">{{'￥' + item.pricePerMan}}</span>
              <span class="old-price" v-if="item.oldPrice">{{'￥' + item.oldPrice}}</span>
            </div>
            <!-- <div v-if="item.sales" class="sales">{{'已售' + item.sales}}</div> -->
            <el-rate
              v-model="item.remarkScore"
              disabled
              show-score
              text-color="#ff9900"
            ></el-rate>
          </div>
        </div>
        <div class="intr-box2" v-else>
          <div class="btn-del" v-if="isShowDel" @click="handleDel(item, $event)">删除</div>
          <h2 class="goods-name">{{item.name}}</h2>
          <div class="other-box">
            <!-- <Star :score="item.remarkScore"></Star> -->
             <el-rate
              v-model="item.remarkScore"
              disabled
              show-score
              text-color="#ff9900"
            ></el-rate>
            <span class="text">{{'￥' + item.price + '/份'}}</span>
          </div>
          <div class="store-name">{{item.store.name}}</div>
          <ul class="promotion-list">
            <li class="_item-box" v-for="(_item, _index) in item.promotion" :key="_index">
              <i class="iconfont icon-fuli" v-if="_item.type === 1"></i>
              <span class="text">{{_item.text}}</span>
            </li>
          </ul>
        </div>
      </li>
    </template>
    <li class="item-box2" v-for="(item, index) in list" :key="index" v-else>
      <div class="check-box">
        <div :class="item.checked ? 'on btn-check':'btn-check'" @click="handlerCheck(index)"></div>
      </div>
      <div class="img-box" @click="$router.push({name: 'detail', params: {id: item.goodsId}})">
        <img class="img" :src="item.imageUrl" :alt="item.name" />
      </div>
      <div class="intr-box" @click="$router.push({name: 'detail', params: {id: item.goodsId}})">
        <h2 class="goods-name">{{item.name}}</h2>
        <div class="star-box">
          <Star :score="5"></Star>
        </div>
        <div class="price">{{'￥' + item.price + '/份'}}</div>
        <div class="btn-box">
          <span class="btn btn-sub" @click="handleToggleNum({goods: item, type: 'sub'}, $event)">
            <i class="iconfont icon-icon-sub"></i>
          </span>
          <span class="num">{{item.amount}}</span>
          <span class="btn btn-add" @click="handleToggleNum({goods: item, type: 'add'}, $event)">
            <i class="iconfont icon-huijianyuyue-fa-"></i>
          </span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
import Star from '@/components/star';

export default {
  name: 'Item',
  components: { Star },
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    isHome: {
      type: Boolean,
      default: false
    },
    isCart: {
      type: Boolean,
      default: false
    },
    isShowDel: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handlerCheck(index) {
      console.log('我被点击了', this.list[index]);
      this.list[index].checked = !this.list[index].checked;
    },
    handleDel(goods, e) {
      e.stopPropagation();
      this.$confirm({
        msg: '你确定要删除该商品吗？',
        confirm: () => this.$store.commit('$handleCollect', goods)
      });
    },
    handleToggleNum(obj, e) {
      e.stopPropagation();
      if (obj.type === 'sub' && obj.goods.amount < 2) {
        return this.$confirm({
          msg: '你确定要删除该商品吗？',
          confirm: () => {
            this.addOrSub(obj.goods, -1);
          }
        });
      }
      this.addOrSub(obj.goods, obj.type === 'sub' ? -1 : 1);
    },
    addOrSub(goods, num) {
      this.$http
        .httpPost('app/cart/save', {
          goodsId: goods.goodsId,
          amount: num,
          name: goods.title,
          imageUrl: goods.coverUrl,
          price: goods.pricePerMan
        })
        .then(res => {
          if (res.code === 0) {
            // 触发父组件重新加载
            this.$emit('emitLoad');
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
    },
    handleToggleChecked(goods, e) {
      e.stopPropagation();
      this.$store.commit('$handleToggleChecked', {
        goods,
        // +的作用是隐式类型转换
        checked: +!goods.checked
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.item-wrap {
  &.padding {
    padding: 0 15px;
    .item-box {
      @include frow(flex-start);
      padding: 15px 0;
    }
  }
  .item-box {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid $bdeee;
    .img-box {
      width: 116px;
      height: 87px;
      .img {
        width: 100%;
        height: 100%;
      }
    }
    .intr-box {
      @include fcol(space-between, stretch);
      flex: 1;
      height: 87px;
      padding: 5px 0 5px 15px;
      font-size: 12px;
      overflow: hidden;
      box-sizing: border-box;
      .top-box {
        @include frow(space-between, baseline);
        .name {
          font-size: 14px;
          color: $fs333;
        }
        .distance {
          color: $fs999;
        }
      }
      .desc {
        height: 30px;
        line-height: 1.2;
        text-align: justify;
        color: $fs999;
        overflow: hidden;
      }
      .bottom-box {
        @include frow(space-between, baseline);
        .price-box {
          @include frow(flex-start, baseline);
          .price {
            font-size: 14px;
            font-weight: bold;
            color: $fsf33;
          }
          .old-price {
            margin-left: 8px;
            text-decoration: line-through;
            color: $fs999;
          }
        }
        .sales {
          color: $fs999;
        }
      }
    }
    .intr-box2 {
      position: relative;
      flex: 1;
      padding-left: 15px;
      font-size: 12px;
      overflow: hidden;
      box-sizing: border-box;
      .btn-del {
        position: absolute;
        right: 0;
        top: 0;
        padding: 5px 15px;
        color: $fswhite;
        border-radius: 5px;
        background: $bgf33;
      }
      .goods-name {
        font-size: 14px;
        color: $fs333;
      }
      .other-box {
        @include frow(flex-start);
        margin-top: 5px;
        .text {
          margin-left: 5px;
        }
      }
      .store-name {
        margin-top: 5px;
        color: $fs999;
      }
      .promotion-list {
        margin-top: 5px;
        ._item-box {
          @include frow(flex-start);
          height: 26px;
          color: $fs333;
          border-top: 1px solid $bdeee;
          .iconfont {
            color: $fsf33;
            margin-right: 7px;
          }
        }
      }
    }
  }
  .item-box2 {
    display: flex;
    padding: 15px 15px 15px 0;
    border-bottom: 1px solid $bdeee;
    .check-box {
      @include frow();
      width: 50px;
      .btn-check {
        position: relative;
        width: 25px;
        height: 25px;
        border: 1px solid $bdeee;
        border-radius: 50%;
        &:after {
          content: "";
          position: absolute;
          left: 3px;
          top: 3px;
          right: 3px;
          bottom: 3px;
          border-radius: 50%;
          transform: scale(0);
          transition: 0.3s;
          background: $bgf33;
        }
        &.on:after {
          transform: scale(1);
        }
      }
    }
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
      font-size: 14px;
      overflow: hidden;
      box-sizing: border-box;
      .goods-name {
        font-size: 14px;
        color: $fs333;
      }
      .star-box {
        margin-top: 8px;
      }
      .price {
        margin-top: 8px;
        color: $fs999;
      }
      .btn-box {
        @include frow(flex-end);
        .btn {
          @include frow();
          width: 25px;
          height: 25px;
          .iconfont {
            color: $fs999;
            font-size: 24px;
          }
        }
      }
      .num {
        @include frow(center, stretch);
        width: 40px;
      }
    }
  }
}
</style>
