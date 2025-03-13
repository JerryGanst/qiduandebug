import axios from 'axios';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://10.180.248.140:8080', // 服务器地址
  timeout: 600000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 设置请求头
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做处理
    return response.data;
  },
  (error) => {
    // 响应错误处理
    return Promise.reject(error);
  }
);

// 封装通用请求方法
export const postRequest = (url, data) => {
  return service({
    method: 'post',
    url,
    data: data, // 将参数转换为 JSON 字符串
  });
};

export default service;