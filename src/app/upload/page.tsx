'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { parseCitiesExcel, parseSalariesExcel, validateCityData, validateSalaryData } from '@/lib/excel-parser'
import { uploadCitiesData, uploadSalariesData, getCitiesList, getSalariesCount } from '@/lib/data-service'

export default function UploadPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'cities' | 'salaries'>('cities')
  const [cities, setCities] = useState<any[]>([])
  const [salariesCount, setSalariesCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('开始加载数据...')
      const citiesResult = await getCitiesList()
      console.log('城市数据结果:', citiesResult)
      if (citiesResult.success) {
        setCities(citiesResult.data)
        console.log('加载了', citiesResult.data.length, '个城市')
      } else {
        console.error('加载城市数据失败:', citiesResult.error)
      }

      const salariesResult = await getSalariesCount()
      console.log('工资数据结果:', salariesResult)
      if (salariesResult.success) {
        setSalariesCount(salariesResult.count)
        console.log('工资数据条数:', salariesResult.count)
      } else {
        console.error('加载工资数据失败:', salariesResult.error)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCitiesFileUpload = async (file: File) => {
    setIsLoading(true)
    setMessage(null)

    try {
      console.log('开始处理城市文件:', file.name)

      // 解析Excel文件
      const data = await parseCitiesExcel(file)
      console.log('解析到的数据:', data)

      // 验证数据
      const validation = validateCityData(data)
      if (!validation.isValid) {
        console.error('数据验证失败:', validation.errors)
        showMessage('error', `数据验证失败：\n${validation.errors.join('\n')}`)
        return
      }

      // 上传数据
      console.log('开始上传数据，条数:', data.length)
      const result = await uploadCitiesData(data)
      console.log('上传结果:', result)

      if (result.success) {
        showMessage('success', `成功上传 ${result.count} 条城市数据`)
        await loadData() // 重新加载数据
      } else {
        console.error('上传失败:', result.error)
        showMessage('error', `上传失败：${result.error}`)
      }
    } catch (error) {
      console.error('处理文件时出错:', error)
      showMessage('error', error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSalariesFileUpload = async (file: File) => {
    setIsLoading(true)
    setMessage(null)

    try {
      console.log('开始处理工资文件:', file.name)

      // 解析Excel文件
      const data = await parseSalariesExcel(file)
      console.log('解析到的数据:', data)

      // 验证数据
      const validation = validateSalaryData(data)
      if (!validation.isValid) {
        console.error('数据验证失败:', validation.errors)
        showMessage('error', `数据验证失败：\n${validation.errors.join('\n')}`)
        return
      }

      // 上传数据
      console.log('开始上传数据，条数:', data.length)
      const result = await uploadSalariesData(data)
      console.log('上传结果:', result)

      if (result.success) {
        showMessage('success', `成功上传 ${result.count} 条工资数据`)
        await loadData() // 重新加载数据
      } else {
        console.error('上传失败:', result.error)
        showMessage('error', `上传失败：${result.error}`)
      }
    } catch (error) {
      console.error('处理文件时出错:', error)
      showMessage('error', error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!selectedCity) {
      showMessage('error', '请选择要计算的城市')
      return
    }

    if (cities.length === 0) {
      showMessage('error', '请先上传城市数据')
      return
    }

    if (salariesCount === 0 || salariesCount === null) {
      showMessage('error', '请先上传工资数据')
      return
    }

    setIsCalculating(true)
    setMessage(null)

    try {
      console.log('开始计算:', selectedCity)

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName: selectedCity }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '计算失败')
      }

      console.log('计算结果:', result)

      showMessage('success', `计算完成！共计算 ${result.batchInfo.totalEmployees} 名员工，公司总费用：¥${result.batchInfo.totalCompanyFee.toFixed(2)}`)

      // 计算成功后跳转到结果页面
      setTimeout(() => {
        router.push('/results')
      }, 2000)

    } catch (error) {
      console.error('计算失败:', error)
      showMessage('error', error instanceof Error ? error.message : '计算失败')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">数据管理</h1>
          <p className="mt-2 text-gray-600">上传城市社保标准和员工工资数据</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p className="text-sm whitespace-pre-line">{message.text}</p>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              调试信息：
              <br />- 城市数据：{cities.length} 条
              <br />- 工资数据：{salariesCount ?? 0} 条
              <br />- SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置'}
              <br />- SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置'}
            </p>
            <button
              onClick={loadData}
              className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
            >
              重新加载数据
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('cities')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                城市社保标准
              </button>
              <button
                onClick={() => setActiveTab('salaries')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'salaries'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                员工工资数据
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'cities' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">城市社保标准数据</h2>

            {/* Current Cities List */}
            {cities.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-medium text-gray-700 mb-2">当前已导入的城市：</h3>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {city.city_name} ({city.year})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <FileUpload
                onFileSelect={handleCitiesFileUpload}
                accept=".xlsx"
                title={isLoading ? "正在处理..." : "点击上传或拖拽文件到此处"}
                description="支持 .xlsx 格式"
                id="cities-file-upload"
              />
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>格式说明：</strong>Excel文件应包含以下字段：
                  <br />• city_name 或 city_namte (城市名称)
                  <br />• year (年份)
                  <br />• base_min (缴费基数下限)
                  <br />• base_max (缴费基数上限)
                  <br />• rate (综合缴纳比例)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">员工工资数据</h2>

            {/* Current Salaries Count */}
            {salariesCount !== null && salariesCount > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  当前已导入 <span className="font-semibold">{salariesCount}</span> 条工资数据
                </p>
              </div>
            )}

            <div className="space-y-4">
              <FileUpload
                onFileSelect={handleSalariesFileUpload}
                accept=".xlsx"
                title={isLoading ? "正在处理..." : "点击上传或拖拽文件到此处"}
                description="支持 .xlsx 格式"
                id="salaries-file-upload"
              />
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>格式说明：</strong>Excel文件应包含以下字段：
                  <br />• employee_id (员工工号)
                  <br />• employee_name (员工姓名)
                  <br />• month (年份月份，格式：YYYYMM)
                  <br />• salary_amount (工资金额)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">执行计算</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择城市
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {cities.length > 0 ? (
                  <>
                    <option value="">请选择城市</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city.city_name}>
                        {city.city_name} ({city.year})
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">请先上传城市数据</option>
                )}
              </select>
            </div>
            <button
              onClick={handleCalculate}
              disabled={cities.length === 0 || salariesCount === 0 || isCalculating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isCalculating ? '正在计算...' :
               cities.length === 0 ? '请先上传城市数据' :
               salariesCount === 0 ? '请先上传工资数据' :
               '执行计算'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}