import * as XLSX from 'xlsx'

export interface CityData {
  city_name?: string
  city_namte?: string  // 处理拼写错误
  year?: string
  base_min?: number
  base_max?: number
  rate?: number
}

export interface SalaryData {
  employee_id?: string
  employee_name?: string
  month?: string
  salary_amount?: number
}

export async function parseCitiesExcel(file: File): Promise<CityData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as CityData[]

        resolve(jsonData)
      } catch (error) {
        reject(new Error('解析城市数据文件失败: ' + error))
      }
    }

    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsArrayBuffer(file)
  })
}

export async function parseSalariesExcel(file: File): Promise<SalaryData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 使用 raw: false 保留数据格式，但会进行一些转换
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as any[]

        // 打印原始数据以调试
        console.log('Excel原始数据（前3条）:', jsonData.slice(0, 3))

        // 数据预处理：确保正确的数据格式
        const processedData = jsonData.map(row => {
          // 处理月份字段：可能是数字（如 202401）或日期，需要转换为 YYYYMM 字符串
          let month = row.month
          if (month !== undefined && month !== null) {
            // 如果是数字，确保是6位数
            if (typeof month === 'number') {
              month = month.toString().padStart(6, '0')
            }
            // 如果是日期，转换为 YYYYMM
            else if (month instanceof Date) {
              const year = month.getFullYear()
              const m = (month.getMonth() + 1).toString().padStart(2, '0')
              month = `${year}${m}`
            }
            // 如果是字符串，去除可能的空格
            else if (typeof month === 'string') {
              month = month.trim().padStart(6, '0')
            }
          }

          // 处理工资金额：确保是数字
          let salaryAmount = row.salary_amount
          if (typeof salaryAmount === 'string') {
            // 移除可能的逗号和空格
            salaryAmount = parseFloat(salaryAmount.replace(/[,，\s]/g, ''))
          }

          return {
            employee_id: row.employee_id,
            employee_name: row.employee_name,
            month: month,
            salary_amount: salaryAmount
          }
        })

        // 打印处理后的数据以调试
        console.log('处理后的数据（前3条）:', processedData.slice(0, 3))

        resolve(processedData)
      } catch (error) {
        reject(new Error('解析工资数据文件失败: ' + error))
      }
    }

    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsArrayBuffer(file)
  })
}

export function validateCityData(data: CityData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || data.length === 0) {
    errors.push('文件内容为空')
    return { isValid: false, errors }
  }

  data.forEach((row, index) => {
    const rowNum = index + 2 // Excel行号从2开始

    // 处理城市名称的拼写错误
    const cityName = row.city_name || row.city_namte
    if (!cityName || typeof cityName !== 'string') {
      errors.push(`第${rowNum}行: 城市名称缺失或格式错误`)
    }

    if (!row.year || typeof row.year !== 'string') {
      errors.push(`第${rowNum}行: 年份缺失或格式错误`)
    }

    if (typeof row.base_min !== 'number' || row.base_min <= 0) {
      errors.push(`第${rowNum}行: 基数下限必须是正数`)
    }

    if (typeof row.base_max !== 'number' || row.base_max <= 0) {
      errors.push(`第${rowNum}行: 基数上限必须是正数`)
    }

    if (typeof row.rate !== 'number' || row.rate <= 0 || row.rate > 1) {
      errors.push(`第${rowNum}行: 费率必须是0到1之间的数字`)
    }
  })

  return { isValid: errors.length === 0, errors }
}

export function validateSalaryData(data: SalaryData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || data.length === 0) {
    errors.push('文件内容为空')
    return { isValid: false, errors }
  }

  // 只显示前5个错误，避免错误信息过多
  const maxErrors = 5

  data.forEach((row, index) => {
    if (errors.length >= maxErrors) return

    const rowNum = index + 2 // Excel行号从2开始

    // 检查工号
    if (!row.employee_id || row.employee_id === '') {
      errors.push(`第${rowNum}行: 员工工号缺失`)
      return
    }

    // 检查姓名
    if (!row.employee_name || row.employee_name === '') {
      errors.push(`第${rowNum}行: 员工姓名缺失`)
      return
    }

    // 检查月份
    if (!row.month && row.month !== 0) {
      errors.push(`第${rowNum}行: 月份缺失`)
      return
    }

    // 验证月份格式 YYYYMM
    const monthStr = row.month.toString()
    const monthPattern = /^\d{4}(0[1-9]|1[0-2])$/
    if (!monthPattern.test(monthStr)) {
      errors.push(`第${rowNum}行: 月份格式错误（${monthStr}），应为YYYYMM格式，如202401`)
      return
    }

    // 检查工资金额
    const salary = parseFloat(row.salary_amount as any)
    if (isNaN(salary) || salary <= 0) {
      errors.push(`第${rowNum}行: 工资金额必须是正数（当前值：${row.salary_amount}）`)
    }
  })

  // 如果有更多错误，添加提示
  if (data.length > maxErrors && errors.length >= maxErrors) {
    errors.push(`...（还有更多错误，请检查数据格式）`)
  }

  return { isValid: errors.length === 0, errors }
}