/**
 * 基于axios封装的http请求
 */
import axios from 'axios';
import store from '../store';

let $http = axios.create({
  timeout: 1000 * 30,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
});

if (process.env.NODE_ENV !== 'production' && process.env.VUE_APP_OPEN_PROXY) {
  $http.defaults.baseURL = '/api';
} else {
  $http.defaults.baseURL = 'http://fun.lsd.info/fun';
}

// 请求拦截器
$http.interceptors.request.use(
  config => {
    config.headers['token'] = store.state.token; // 请求头带上
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
$http.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    if (response.data && response.data.code === 401) {
      // 401, token失效
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

// get 请求
$http.httpGet = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    $http
      .get(url, {
        params
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// put 请求
$http.httpPut = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    $http
      .put(url, params)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// post请求
$http.httpPost = (url, data = {}, params = {}) => {
  return new Promise((resolve, reject) => {
    $http({
      url,
      method: 'post',
      // 发送的数据
      data,
      // url参数
      params
    })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// delete 请求
$http.httpDelete = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    $http
      .delete(url, {
        params
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export default $http;
