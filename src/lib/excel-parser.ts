import * as XLSX from 'xlsx'

export interface CityData {
  id?: number
  city_name?: string
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

        // 使用标准方式解析，自动识别列名
        // 使用 raw: true 获取原始值，避免自动转换
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as any[]
        console.log('=== EXCEL PARSE DEBUG ===')
        console.log('解析的城市数据（原始）:', jsonData)
        console.log('数据行数:', jsonData.length)

        if (jsonData.length > 0) {
          const keys = Object.keys(jsonData[0])
          console.log('=== COLUMN HEADER DEBUG ===')
          console.log('读取到的列名数量:', keys.length)
          console.log('所有列名:')
          keys.forEach((key, index) => {
            console.log(`  ${index + 1}. "${key}" (长度: ${key.length}, 字符码:`, [...key].map(c => c.charCodeAt(0)), ')')
          })

          // 查找可能的城市名称列
          const possibleCityColumns = keys.filter(key =>
            key.toLowerCase().includes('city') ||
            key.includes('城市') ||
            key.toLowerCase().includes('name')
          )
          console.log('可能是城市名称的列:', possibleCityColumns)

          console.log('\n第一行的完整数据:')
          keys.forEach(key => {
            console.log(`  ${key}: "${jsonData[0][key]}" (类型: ${typeof jsonData[0][key]})`)
          })
          console.log('=== END COLUMN DEBUG ===')
        }

        // 创建字段映射（支持中英文列名）
        const fieldMapping: { [key: string]: string } = {}
        const keys = Object.keys(jsonData[0] || {})

        // 查找并映射字段
        keys.forEach(key => {
          const lowerKey = key.toLowerCase().trim()
          if (lowerKey === 'id' || lowerKey === '序号') {
            fieldMapping[key] = 'id'
          } else if (lowerKey === 'city_name' || key.includes('城市') || lowerKey.includes('city name')) {
            fieldMapping[key] = 'city_name'
          } else if (lowerKey === 'year' || key.includes('年份') || key.includes('年度')) {
            fieldMapping[key] = 'year'
          } else if (lowerKey === 'base_min' || key.includes('基数下限') || key.includes('下限')) {
            fieldMapping[key] = 'base_min'
          } else if (lowerKey === 'base_max' || key.includes('基数上限') || key.includes('上限')) {
            fieldMapping[key] = 'base_max'
          } else if (lowerKey === 'rate' || key.includes('费率') || key.includes('比例')) {
            fieldMapping[key] = 'rate'
          }
        })

        console.log('字段映射:', fieldMapping)

        // 转换数据，使用映射后的字段名
        const processedData = jsonData.map((row: any) => {
          const mappedRow: any = {}

          // 应用字段映射
          Object.keys(fieldMapping).forEach(originalKey => {
            const mappedKey = fieldMapping[originalKey]
            mappedRow[mappedKey] = row[originalKey]
          })

          console.log(`处理行数据:`, {
            原始row: row,
            映射后: mappedRow
          })

          return {
            id: mappedRow.id !== undefined && mappedRow.id !== null ? parseInt(mappedRow.id) : undefined,
            city_name: mappedRow.city_name !== undefined && mappedRow.city_name !== null ? String(mappedRow.city_name).trim() : '',
            year: mappedRow.year !== undefined && mappedRow.year !== null ? String(mappedRow.year).trim() : '',
            base_min: mappedRow.base_min !== undefined && mappedRow.base_min !== null ? parseFloat(mappedRow.base_min) : 0,
            base_max: mappedRow.base_max !== undefined && mappedRow.base_max !== null ? parseFloat(mappedRow.base_max) : 0,
            rate: mappedRow.rate !== undefined && mappedRow.rate !== null ? parseFloat(mappedRow.rate) : 0
          }
        })

        console.log('处理后的城市数据:', processedData)
        resolve(processedData as CityData[])
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

  console.log('验证城市数据，数据条数:', data?.length)
  console.log('第一条数据:', data[0])

  if (!data || data.length === 0) {
    errors.push('文件内容为空')
    return { isValid: false, errors }
  }

  data.forEach((row, index) => {
    const rowNum = index + 2 // Excel行号从2开始
    console.log(`验证第${rowNum}行数据:`, row)

    const cityName = row.city_name
    console.log(`第${rowNum}行城市名称检查:`, {
      原始值: row.city_name,
      转换后值: cityName,
      类型: typeof cityName,
      长度: cityName ? cityName.length : 0,
      trim后: cityName ? cityName.trim() : '',
      是否为空: !cityName,
      是否不是字符串: typeof cityName !== 'string',
      trim后是否为空: cityName ? cityName.trim() === '' : 'N/A'
    })

    if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
      console.error(`第${rowNum}行城市名称问题:`, {
        city_name: row.city_name,
        type: typeof cityName,
        value: cityName,
        trimmed: cityName ? cityName.trim() : 'N/A'
      })
      errors.push(`第${rowNum}行: 城市名称缺失或格式错误`)
    }

    if (!row.year || typeof row.year !== 'string' || row.year.trim() === '') {
      console.error(`第${rowNum}行年份问题:`, {
        year: row.year,
        type: typeof row.year
      })
      errors.push(`第${rowNum}行: 年份缺失或格式错误`)
    }

    const base_min = parseFloat(row.base_min)
    if (isNaN(base_min) || base_min <= 0) {
      errors.push(`第${rowNum}行: 基数下限必须是正数`)
    }

    const base_max = parseFloat(row.base_max)
    if (isNaN(base_max) || base_max <= 0) {
      errors.push(`第${rowNum}行: 基数上限必须是正数`)
    }

    const rate = parseFloat(row.rate)
    if (isNaN(rate) || rate <= 0 || rate > 1) {
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