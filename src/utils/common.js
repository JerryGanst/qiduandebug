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