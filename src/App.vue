<template>
  <div id="app">
    <!-- <nav>
      <router-link to="/">login</router-link> |
      <router-link to="/main">main</router-link>
    </nav> -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style lang="less">
body {
  margin: 0px;
  background-color: #eaeaea;
}
* {
  box-sizing: content-box;
}
.el-menu {
  max-height: 620px;
  overflow-y: auto;
}
/* WebKit 浏览器滚动条样式 */
.el-menu::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
}

.el-menu::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景颜色 */
  border-radius: 0px; /* 轨道圆角 */
}

.el-menu::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
}

.el-menu::-webkit-scrollbar-thumb:hover {
  background: #555; /* 滑块悬停时的颜色 */
}
.el-textarea__inner {
  padding: 18px 60px 18px 15px !important;
  letter-spacing: 1px; /* 设置字间距 */
}
.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-menu-item {
  height: 40px;
  padding: 0 50px 0 15px !important;
}
.el-menu-item span {
  height: 40px;
  line-height: 40px;
}

.el-textarea__inner {
  background-color: #fff !important;
}
.el-textarea__inner {
  border-radius: 16px !important;
}
/* WebKit 浏览器滚动条样式 */
.el-textarea__inner::-webkit-scrollbar {
  width: 1px; /* 滚动条宽度 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-track {
  background: rgba(135, 206, 235, 0); /* 轨道背景颜色 */
  border-radius: 16px; /* 轨道圆角 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-thumb {
  background: rgba(135, 206, 235, 0); /* 滑块颜色 */
  border-radius: 0px; /* 滑块圆角 */
  border: 1px solid #f1f1f1; /* 滑块边框 */
  opacity: 0;
}

.el-textarea__inner::-webkit-scrollbar-thumb:hover {
  background: rgba(135, 206, 235, 0); /* 滑块悬停时的颜色 */
  opacity: 0;
}
.el-menu-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-icon {
  color: #707070 !important;
}
</style>
