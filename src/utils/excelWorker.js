// public/excelWorker.js
importScripts('https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js')

self.onmessage = function (e) {
  try {
    const data = e.data

    // 读取Excel文件
    const workbook = XLSX.read(data, {
      type: 'array',
      sheetRows: 10, // 只读取前10行
      dense: true
    })

    // 获取第一个工作表
    if (workbook.SheetNames.length === 0) {
      throw new Error('Excel文件中没有工作表')
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

    // 转换为JSON格式
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1, // 包含标题行
      defval: '' // 空单元格默认值
    })

    // 返回处理结果
    self.postMessage({
      success: true,
      data: jsonData
    })
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    })
  }
}
