<template>
  <div class="cart-wrap">
    <Header title="购物车" :btn="_btn" @emitClick="isEdit = !isEdit"></Header>
    <!-- 主体内容 -->
    <template v-if="list.length">
      <Scroll isBottom :data="list">
        <Item :list="list" isCart @emitLoad="init"></Item>
      </Scroll>
      <div class="balance-box" v-if="list.length">
        <div class="left" @click="$store.commit('$handleToggleChecked', {checked: +!_allChecked})">
          <div class="check-box">
            <div class="btn-check" @click="checkedAll" :class="{on: _allChecked}"></div>
          </div>
          <div class="text">全选</div>
        </div>
        <div class="total" v-if="!isEdit">{{'合计: ￥' + _totalMoney}}</div>
        <div
          class="btn-handle"
          :class="{enable: _totalMoney > 0}"
          @click="handleClick"
        >{{isEdit ? '删除' : '去结算'}}</div>
      </div>
    </template>
    <div class="nothing-box" v-else>快去选购你喜欢的商品吧</div>
  </div>
</template>

<script>
import { Item } from '@/components';

export default {
  name: 'Cart',
  components: { Item },
  data() {
    return {
      isEdit: false,
      list: []
    };
  },
  computed: {
    _btn() {
      if (!this.list.length) {
        return '';
      }
      return this.isEdit ? '完成' : '编辑';
    },
    _allChecked() {
      return !this.list.find(item => !item.checked);
    },
    _totalMoney() {
      let total = 0;
      this.list.forEach(goods => {
        if (goods.checked) {
          total += goods.amount * goods.price;
        }
      });
      return total.toFixed(2);
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$http
        .httpGet('/app/cart/list')
        .then(res => {
          if (res.code === 0) {
            this.list = res.list;
            this.list.forEach(goods => {
              // goods.checked = false;  //vue不会监听新增的未定义属性,如果不强制刷新是不能动态渲染的
              this.$set(goods, 'checked', false); // 给对象的checked属性加监听,实现动态渲染
            });
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
    },
    handleClick() {
      if (this._totalMoney > 0) {
        if (this.isEdit) {
          let boughtGoodsIds = [];
          this.list.forEach(goods => {
            if (goods.checked) {
              boughtGoodsIds.push(goods.goodsId);
            }
          });
          return this.$confirm({
            msg: '你确定要删除选中项？',
            confirm: () => {
              this.$http
                .httpPost('/app/cart/delete', boughtGoodsIds)
                .then(res => {
                  if (res.code === 0) {
                    this.$toast({ msg: '删除成功', duration: 5e2 });
                    this.init();
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
          });
        }
        // 当前购物车快照存到vuex中
        let checkedGoods = [];
        this.list.forEach(goods => {
          if (goods.checked) {
            checkedGoods.push(goods);
          }
        });
        this.$store.commit('$checkedGoods', checkedGoods);
        this.$router.push({ name: 'payment', params: { from: 'cart' } });
      }
    },
    checkedAll() {
      if (this._allChecked) {
        this.list.forEach(goods => {
          goods.checked = false;
        });
      } else {
        this.list.forEach(goods => {
          goods.checked = true;
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.cart-wrap {
  height: 100vh;
  font-size: 14px;
  color: $fs333;
  .balance-box {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 50px;
    height: 50px;
    @include frow(space-between);
    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      border-top: 1px solid $bdeee;
    }
    .left {
      @include frow(flex-start);
      height: 100%;
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
    }
    .btn-handle {
      @include frow();
      width: 100px;
      height: 100%;
      color: $fswhite;
      background: $bgeee;
      &.enable {
        background: $bgf33;
      }
    }
  }
  .nothing-box {
    @include frow();
    height: 100px;
  }
}
</style>
