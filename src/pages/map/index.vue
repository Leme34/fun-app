<template>
  <div class="map-wrap">
    <Header title="地图找房"></Header>
    <div class="baidu-map">
      <baidu-map
        ak="***"
        class="map"
        :style="{width:map.width,height:map.height}"
        :zoom="map.zoom"
        :center="{lng: map.center.lng, lat: map.center.lat}"
        @ready="ready"
        :scroll-wheel-zoom="true"
        @zoomend="zoomend"
        @dragend="dragend"
        ref="map"
      >
        <!--比例尺控件-->
        <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT" :offset="{width:4,height:2}"></bm-scale>
        <!--缩放控件-->
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT" :offset="{width:4,height:30}"></bm-navigation>
        <!-- 定位控件 -->
        <bm-geolocation
          anchor="BMAP_ANCHOR_BOTTOM_RIGHT"
          :showAddressBar="true"
          :autoLocation="true"
          :offset="{width:4,height:1}"
        ></bm-geolocation>
        <!-- 城市列表 -->
        <bm-city-list anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-city-list>
        <!-- 地图类型 -->
        <bm-map-type
          :map-types="['BMAP_HYBRID_MAP','BMAP_NORMAL_MAP']"
          anchor="BMAP_ANCHOR_TOP_LEFT"
        ></bm-map-type>
        <!-- 行政区划范围 -->
        <bm-boundary
          v-for="(item) in areaList"
          :key="item.key"
          :name="item.key"
          :ref="'boundary'+item.key"
          :strokeWeight="0"
          strokeColor="none"
          :fillOpacity="0"
          fillColor="none"
        ></bm-boundary>
        <!-- 标签 -->
        <bm-label
          v-if="locationParams.level<12"
          v-for="(item) in areaList"
          :key="item.key+'1'"
          :ref="'label'+item.key"
          :content="item.text"
          :position="{lng: item.lng, lat: item.lat}"
          :labelStyle="labelStyle"
          :offset="labelSize"
          :title="item.key"
          @mouseover="labelMouseover"
          @mouseout="labelMouseout"
          @dblclick="labelDbClick"
        />
        <bm-marker
          v-if="locationParams.level>=12"
          v-for="(item) in housePage.list"
          :key="item.id"
          :title="item.title"
          :position="{lng: item.lng, lat: item.lat}"
          :dragging="false"
          animation="BMAP_ANIMATION_BOUNCE"
          @click="infoWindowOpen"
        ></bm-marker>
      </baidu-map>
    </div>
    <div class="selector-group">
      <el-select v-model="housePage.order_field" placeholder="排序方式" @change="reloadHouseList">
        <el-option
          v-for="item in sortOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-switch
        style="display: block"
        v-model="housePage.order"
        active-color="#13ce66"
        inactive-color="#ff4949"
        inactive-text="☝"
        inactive-value="asc"
        active-text="👇"
        active-value="desc"
        @change="reloadHouseList"
      ></el-switch>
    </div>
    <Scroll
      class="house-scroll"
      pullUpLoad
      :data="housePage.list"
      :isHasMore="housePage.more"
      @emitLoad="loadMoreHouseList()"
      ref="scrollRef"
    >
      <!-- 房源列表 -->
      <div class="hot-box">
        <!-- <h2 class="title">房源列表</h2> -->
        <Item :list="housePage.list" isHome></Item>
      </div>
    </Scroll>
  </div>
</template>

<script>
import {
  BaiduMap,
  BmScale,
  BmNavigation,
  BmGeolocation,
  BmCityList,
  BmMapType,
  BmBoundary,
  BmLabel,
  BmMarker
} from 'vue-baidu-map';
import { Item } from '@/components';
export default {
  name: 'Register',
  components: {
    BaiduMap,
    BmScale,
    BmNavigation,
    BmGeolocation,
    BmCityList,
    BmMapType,
    BmBoundary,
    BmLabel,
    Item,
    BmMarker
  },
  data() {
    return {
      map: {
        center: { lng: 113.3, lat: 22.8 }, // '顺德',
        zoom: 10,
        width: '375px',
        height: '300px'
      },
      areaList: [],
      houseList: [],
      locationParams: {}, // 当前地图视野经纬度信息
      labelStyle: {
        height: '78px',
        width: '78px',
        color: '#fff',
        backgroundColor: '#0054a5',
        border: '0px solid rgb(255, 0, 0)',
        borderRadius: '50%', // 圆圈形状
        fontWeight: 'bold',
        display: 'inline',
        lineHeight: 'normal',
        textAlign: 'center',
        opacity: '0.3',
        zIndex: 2,
        overflow: 'hidden'
      },
      labelSize: {},
      userLocation: '', // 用户当前定位
      housePage: {
        // 房源列表分页参数
        list: [],
        start: 1, // 起始位置
        order_field: '',
        order: 'asc',
        more: true
      },
      currentCity: '', // 当前地图视野中心的市级行政单位
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
          label: '最新',
          value: ''
        }
      ]
    };
  },
  activated() {
    // 解决搜索回来页面不能滚动bug
    if (this.$refs.scrollRef) {
      this.$refs.scrollRef.handleRefresh();
    }
  },
  methods: {
    // 缩放事件监听
    zoomend(event) {
      this.mapResize(event.target);
    },
    // 地图拖拽完成事件监听
    dragend(event) {
      this.mapResize(event.target);
    },
    // 加载获取当前视野所在市级单位下的区级单位数据
    loadAreaAggData(city) {
      // 加载地区聚合标签数据
      this.$http
        .httpGet('/app/shop/area', {
          cityName: city
        })
        .then(res => {
          if (res.code === 0) {
            this.areaList = res.data;
            // 添加地区文本标签
            this.areaList.forEach(area => {
              // 文本内容
              area.text =
                '<p style="margin-top: 20px; pointer-events: none">' +
                area.key +
                '</p>' +
                '<p style="pointer-events: none">' +
                area.count +
                '套</p>';
            });
          } else {
            this.$message({
              showClose: true,
              message: '地区聚合信息加载失败,原因:' + res.msg,
              type: 'error'
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
    // 加载视野中的房源列表
    loadHouseList() {
      // 若已经定位过了
      if (this.userLocation) {
        this.doLoadHouseList();
      } else {
        // 先定位到用户当前坐标
        let geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(
          r => {
            // 记录用户当前位置
            this.userLocation = {
              lng: r.point.lng,
              lat: r.point.lat
            };
            this.doLoadHouseList();
          },
          { enableHighAccuracy: true }
        );
      }
    },
    // 请求视野中的房源列表
    doLoadHouseList() {
      if (!this.housePage.more) {
        return;
      }
      this.$http
        .httpGet('/app/shop/map-houses', {
          city: this.currentCity,
          lng: this.userLocation.lng,
          lat: this.userLocation.lat,
          level: this.locationParams.level,
          leftLongitude: this.locationParams.leftLongitude,
          leftLatitude: this.locationParams.leftLatitude,
          rightLongitude: this.locationParams.rightLongitude,
          rightLatitude: this.locationParams.rightLatitude,
          page: this.housePage.start,
          limit: 999, // TODO 因为LBS云麻点用不了,为了显示所有麻点(marker)不得不把分页加载更多改为加载所有
          order_field: this.housePage.order_field,
          order: this.housePage.order
        })
        .then(res => {
          if (res.code === 0) {
            this.housePage.list = [...this.housePage.list, ...res.data.list];
            this.housePage.start = this.housePage.list.length + 1; // 起始位置+1
            this.housePage.more = res.more;
          } else {
            this.$message({
              showClose: true,
              message: '房源列表加载失败,原因:' + res.msg,
              type: 'error'
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
    loadMoreHouseList() {
      if (!this.housePage.more) {
        return;
      }
      // 解决better-scroll的pullingUp事件重复触发问题
      if (this.housePage.start === 1) {
        return;
      }
      this.loadHouseList();
    },
    // 先初始化分页数据再加载视野中的房源列表
    reloadHouseList() {
      this.housePage = {
        // 房源列表分页参数
        list: [],
        start: 1, // 起始位置
        order_field: this.housePage.order_field, // 保留之前用户选择的排序方式
        order: this.housePage.order, // 保留之前用户选择的排序方式
        more: true
      };
      this.loadHouseList();
    },
    /**
     * 地图组件渲染完毕时触发，返回一个百度地图的核心类和地图实例。百度地图组件是异步加载，请不要尝试在组件的生命周期中访问 BMap 核心类和 map 实例，如有需要，请在所需组件的 ready 事件回调函数的参数中获取。
     */
    ready({ BMap, map }) {
      this.labelSize = new BMap.Size(-70, -50); // 宽,高
    },
    /**
     * 根据地图缩放级别查询地图当前视野边界范围内的房源
     * @param _map event.target
     */
    mapResize(_map) {
      // 地址解析得到中心点所在市级单位
      let center = _map.getCenter();
      new BMap.Geocoder().getLocation(
        new BMap.Point(center.lng, center.lat),
        result => {
          if (result) {
            this.currentCity = result.addressComponents.city;
            // 获取当前市级单位下的所有区级单位 及其 房源信息
            this.loadAreaAggData(this.currentCity);
            this.reloadHouseList();
          }
        }
      );
      // 获取视野边界
      let bounds = _map.getBounds();
      let southWest = bounds.getSouthWest(); // 西南角
      let northEast = bounds.getNorthEast(); // 东北角
      let zoomLevel = _map.getZoom(); // 缩放级别

      // 缩放级别>12的时候隐藏所有地区的聚合信息标签，改用v-if实现
      // 然后显示LBS的云麻点数据(百度LBS云抽风用不了)
      // if (zoomLevel >= 12) {
      //   let customLayer = new BMap.CustomLayer({
      //     geotableId: 209006,
      //     q: '', // 检索关键字
      //     tags: '', // 空格分隔的多字符串
      //     filter: '' // 过滤条件,参考http://lbsyun.baidu.com/index.php?title=lbscloud/api/geosearch
      //   });
      //   _map.addTileLayer(customLayer); // 添加自定义图层
      //   console.log(customLayer);
      // }

      // 把获取到的当前视野边界参数放入请求参数中
      this.locationParams = {
        level: zoomLevel,
        leftLongitude: southWest.lng, // 左上角
        leftLatitude: northEast.lat,
        rightLongitude: northEast.lng, // 右下角
        rightLatitude: southWest.lat
      };
      // console.log('this.locationParams:' + JSON.stringify(this.locationParams));
    },
    labelDbClick({ type, target, point, pixel }) {
      let map = target.getMap();
      map.zoomIn(); // 放大地图
      map.panTo(point); // 地图中心点移动到事件的触发点
    },
    labelMouseover({ type, target, point, pixel }) {
      let region = target.getTitle();
      this.showBoundary(region);
    },
    labelMouseout({ type, target, point, pixel }) {
      let region = target.getTitle();
      this.hideBoundary(region);
    },
    hideBoundary(region) {
      let dom = this.$refs['boundary' + region][0];
      dom.strokeWeigh = 0; // 宽度
      dom.strokeColor = ''; // 颜色
      dom.fillOpacit = 0; // 填充透明度
      dom.fillColor = ''; // 填充颜色
    },
    showBoundary(region) {
      let dom = this.$refs['boundary' + region][0];
      dom.strokeWeight = 2; // 宽度
      dom.strokeColor = '#0054a5'; // 颜色
      dom.fillOpacity = 0.3; // 填充透明度
      dom.fillColor = '#0054a5'; // 填充颜色
    }
  }
};
</script>

<style lang="scss" scoped>
.map-wrap {
  height: 100vh;
  font-size: 14px;
  color: $fs333;

  .baidu-map {
    height: 300px;
  }

  .selector-group {
    width: 100%;
    display: flex;
    .el-select {
      width: 50%;
      ::v-deep .el-input__inner {
        text-align: center;
      }
    }
    .el-switch {
      width: 50%;
      height: 40px;
      line-height: inherit;
      text-align: center;
      margin-top: 12px;
      ::v-deep .el-switch__label {
        * {
          height: inherit;
          line-height: inherit;
          text-align: center;
        }
      }
    }
  }

  .house-scroll {
    position: absolute;
    left: 0;
    top: 390px;
    right: 0;

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
