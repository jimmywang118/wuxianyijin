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
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as SalaryData[]

        resolve(jsonData)
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

  data.forEach((row, index) => {
    const rowNum = index + 2 // Excel行号从2开始

    if (!row.employee_id || typeof row.employee_id !== 'string') {
      errors.push(`第${rowNum}行: 员工工号缺失或格式错误`)
    }

    if (!row.employee_name || typeof row.employee_name !== 'string') {
      errors.push(`第${rowNum}行: 员工姓名缺失或格式错误`)
    }

    if (!row.month || typeof row.month !== 'string') {
      errors.push(`第${rowNum}行: 月份缺失或格式错误`)
    }

    // 验证月份格式 YYYYMM
    const monthPattern = /^\d{4}(0[1-9]|1[0-2])$/
    if (row.month && !monthPattern.test(row.month)) {
      errors.push(`第${rowNum}行: 月份格式应为YYYYMM，如202401`)
    }

    if (typeof row.salary_amount !== 'number' || row.salary_amount <= 0) {
      errors.push(`第${rowNum}行: 工资金额必须是正数`)
    }
  })

  return { isValid: errors.length === 0, errors }
}