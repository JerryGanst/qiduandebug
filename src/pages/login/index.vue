<template>
  <div class="login-container">
    <el-form :model="loginForm" :rules="rules" ref="loginForms" class="login-form">
      <div class="login_text">
        <span class="big_title">立讯AI平台</span>
      </div>
      <el-form-item label="用户名" prop="username" class="form-item">
        <el-input v-model="loginForm.username" placeholder="请输入用户名(工号)" clearable></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" class="form-item">
        <el-input
          v-model="loginForm.password"
          placeholder="请输入密码"
          clearable
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #suffix>
            <el-icon @click="togglePasswordVisibility" style="cursor: pointer;">
              <component :is="passwordVisible ? View : Lock" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item class="button-item" style="display: flex;justify-content: center;width: 100%;margin-top: 40px;">
        <el-button type="primary" @click="submitForm" style="width: 300px;height: 40px;">登录</el-button>
      </el-form-item>
    </el-form>


  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { View, Lock } from '@element-plus/icons-vue'; // 引入需要的图标
export default {
  setup() {
    const router = useRouter();
    const loginForm = ref({
      username: '',
      password: '',
    });

    const passwordVisible = ref(false);

    const rules = {
      username: [
        { required: true, message: '请输入用户名(工号)', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
      ],
    };

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };
    const submitForm = async () => {
      const data = {
          userid:loginForm.value.username,
          password:loginForm.value.password
      }
      try {
        // 替换为实际的后端接口地址
        const response = await fetch('http://10.180.248.140:8080/UserInfo/login', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)

        })
        const res = await response.json();
        if(res.data && res.data.clientStatus==='PASS'){
          ElMessage.success('登录成功');
          router.push('/main');
        } else if(res.data && res.data.clientStatus!=='PASS'){
          ElMessage.error(res.data.message);
        } else{
          ElMessage.error('登录失败,请稍后再试');
        }
      } catch (error) {
          // loadingInstance.close();
          console.error('获取回复失败:', error);
          // botMessage.text = '抱歉，暂时无法获取回复';
        }
    };

    return {
      loginForm,
      passwordVisible,
      rules,
      togglePasswordVisibility,
      submitForm,
      View, // 注册图标组件
      Lock, // 注册图标组件
    };
  },
};
</script>

<style scoped>
.login_text{
  text-align: center;
  margin: 10px 0 40px 0;
}
.big_title{
  font-size: 20px;
  font-weight: bold;
}
.small_title{
  font-size: 14px;
  color: #333;
  padding-left: 10px;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url(../../assets/back.jfif);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.login-form {
  width: 360px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  /* position: absolute;
  right: 100px;
  bottom: 250px; */
}

/* 设置 label 右对齐 */
.form-item :deep(.el-form-item__label) {
  text-align: right;
  width: 80px; /* 调整 label 的宽度 */
  padding-right: 8px; /* 调整 label 和输入框的间距 */
}

/* 设置输入框长度一致 */
.form-item :deep(.el-input) {
  width: 247px; /* 输入框宽度占满剩余空间 */
}
.form-item :deep(.el-form-item__content) {
  justify-content: flex-start;
}
:deep(.el-form-item__content) {
  justify-content: center;
}

/* 登录按钮水平居中对齐 */
.button-item {
  display: flex;
  justify-content: center;
}
</style>