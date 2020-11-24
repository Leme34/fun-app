import Vue from 'vue';
import BScroll from 'better-scroll';
import App from './App';
import router from './router';
import store from './store';
import sesstion from './utils/storage';
import { Header, Scroll, Toast, Confirm } from './components';
import './common/scss/index.scss';
import './plugins/element';
import $http from './utils/http';
// 导入mock数据，npm run build前，请手动注释，否则将使用mock数据
import './utils/mock';

Vue.config.productionTip = false;
Vue.use(Header);
Vue.use(Scroll);
Vue.use(Toast);
Vue.use(Confirm);
Vue.prototype.$http = $http;
Vue.prototype.$BScroll = BScroll;
Vue.prototype.$sesstion = sesstion;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
