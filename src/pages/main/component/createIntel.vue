<template>
  <div class="create_main" v-if="intelList.length > 0">
    <div class="create_title">创建智能体</div>
    <div class="create_content">
      <div class="create_name">
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">名称</span>
        </div>
        <div class="create_input">
          <el-input placeholder="给您的智能体取个名字吧" style="width: 100%" v-model="formIntel.name" maxlength="15">
            <template #suffix>
              <span class="char-counter">{{ formIntel.name.length }}/15</span>
            </template>
          </el-input>
        </div>
      </div>

      <div class="create_set">
        <div class="create_ai">智能补充</div>
        <div class="create_text">
          <span style="color: #ff4d4f">*</span>
          <span style="padding-left: 5px">设定</span>
        </div>
        <div class="create_input">
          <el-input
            placeholder="您的智能体有什么样的技能呢？它又有什么样的背景？"
            style="width: 100%"
            v-model="formIntel.set"
            type="textarea"
          ></el-input>
        </div>
      </div>
      <div class="create_btn">
        <div class="create_cancel">取消</div>
        <div class="create_confirm">创建</div>
      </div>
    </div>
  </div>
  <div class="empty" v-else>
    <div class="empty_img"><img src="@/assets/kong.png" /></div>
    <div class="empty_text">暂无智能体</div>
    <div class="empty_create">创建智能体</div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useShared } from '@/utils/useShared'
const { intelList } = useShared()
const formIntel = ref({
  name: '',
  set: ''
})
</script>
<style lang="less" scoped>
.empty {
  width: 80%;
  margin-left: 10%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .empty_create {
    width: 140px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    background-color: #1b6cff;
    color: #fff;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    margin-top: 40px;
  }
  .empty_text {
    color: #6a6a6a;
    font-size: 16px;
    margin-top: 40px;
  }
  .empty_img {
    width: 100px;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.create_main {
  width: 80%;
  margin-left: 10%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: #fff;
  .create_title {
    font-size: 18px;
    width: 100%;
    color: #262626;
    padding-top: 25px;
  }
  .create_content {
    width: 726px;
    display: flex;
    flex-direction: column;
    margin-top: 100px;
    color: #333333;
    font-size: 14px;
    line-height: 18px;
    margin-left: 50px;
    .create_name {
      display: flex;
      flex-direction: column;
      .create_input {
        margin-top: 5px;
        :deep(.el-input__wrapper) {
          border: 1px solid #b7b8b9;
          height: 36px;
          border-radius: 4px;
          line-height: 36px;
          box-sizing: border-box;
          padding-left: 15px;
        }
      }
    }

    .create_set {
      display: flex;
      flex-direction: column;
      margin-top: 30px;
      position: relative;
      .create_ai {
        width: 120px;
        border-radius: 4px;
        height: 32px;
        font-size: 14px;
        text-align: center;
        box-sizing: border-box;
        background-color: #e6f4ff;
        color: #1b6cff;
        line-height: 32px;
        position: absolute;
        text-indent: 20px;
        right: 0;
        top: -15px;
        background-image: url('@/assets/ai.png');
        background-repeat: no-repeat;
        background-size: 19px 16px;
        background-position: 16px 8px;
        cursor: pointer;
      }
      .create_input {
        margin-top: 5px;
        :deep(.el-textarea__inner) {
          border-radius: 4px !important;
          padding: 10px 15px !important;
          height: 120px;
          resize: none;
          border-radius: 4px;
        }
      }
    }
    .create_btn {
      display: flex;
      margin-top: 25px;
      justify-content: center;
      font-size: 14px;
      .create_cancel {
        width: 120px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #dedede;
        border-radius: 4px;
        color: #333333;
        cursor: pointer;
      }
      .create_confirm {
        width: 120px;
        height: 32px;
        text-align: center;
        line-height: 32px;
        border: 1px solid #1b6cff;
        border-radius: 4px;
        background-color: #1b6cff;
        color: #fff;
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
