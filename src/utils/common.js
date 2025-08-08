import excel from '@/assets/excl.png'
import word from '@/assets/w.png'
import text from '@/assets/text.png'
import pdf from '@/assets/pdf.png'
import ppt from '@/assets/ppt.png'
// excel文件解析预览方法
export const beforeTransformData = (data) => {
  data._worksheets.forEach(worksheet => {
    let line = 0;
    if( worksheet._rows[line] && worksheet._rows[line]._cells) {
      for(let i = 0; i < worksheet._rows[line]._cells.length; i++) {
        let cell = worksheet._rows[line]._cells[i];
        if(!cell) {
          // 创建缺失单元格
          worksheet._rows[line]._cells[i] = {
            text: '',
            value: '',
            style: { bgcolor: '#00ff00' } // 绿色背景
          };
        } else {
          // 修改现有单元格
          cell.style = { bgcolor: '#00ff00' };
        }
      }
    }
  });
  return data;
};

// 定义内容类型枚举
export const PageType = {
  CREATE_PAGE: 1, // 创建页
  LIST_PAGE: 2,    // 智能体列表页
  EMPTY_PAGE: 3, // 未创建智能体的空页面
  EDIT_PAGE: 4 // 编辑页
};

// 判断返回上一页时原始页面来源
export const FromPage = {
  FROM_EMPTY_PAGE: 1, // 从空页面进来
  FROM_LIST_PAGE: 2, // 从列表页面进来
}

// 定义内容类型枚举
export const ContentType = {
  CONVERSATION: 1, // 对话
  KNOWLEDGE: 2,    // 知识库
  AGENT: 3         // 智能体
};


const extensionMap = new Map([
  ['txt', text],
  ['pdf', pdf],
  ['ppt', ppt],
  ['pptx', ppt],
  ['xls', excel],
  ['xlsx', excel],
  ['doc', word],
  ['docx', word],
]);

export const pictureTypes = ['jpg','jpeg','png','gif']

export const getFileImgByOriginFile = (file) => {
  let origFileName = file.originalFileName;
  const fileExtension = origFileName.split('.').pop().toLowerCase();
  if (file.fileUrl && pictureTypes.includes(fileExtension)) {
    return file.fileUrl;
  }
  return extensionMap.get(fileExtension) || text;
}

export const getFileImg = (file) => {
  if (pictureTypes.includes(file.extension)) {
    return URL.createObjectURL(file.raw)
  }

  return extensionMap.get(file.extension) || text
}