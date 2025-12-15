'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface CalculationResult {
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
  batch_id: string
  city_name: string
  calculation_date: string
}

interface BatchInfo {
  id: string
  city_name: string
  total_employees: number
  total_company_fee: number
  description?: string
  created_at: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<CalculationResult[]>([])
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestResults()
  }, [])

  const fetchLatestResults = async () => {
    try {
      // 获取最新的批次
      const { data: latestBatch, error: batchError } = await supabase
        .from('calculation_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (batchError && batchError.code !== 'PGRST116') {
        console.error('获取批次信息失败:', batchError)
      }

      if (latestBatch) {
        setBatchInfo(latestBatch)

        // 获取该批次的计算结果
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .eq('batch_id', latestBatch.id)
          .order('employee_name')

        if (resultsError) {
          console.error('获取计算结果失败:', resultsError)
          setError('获取计算结果失败')
        } else {
          setResults(resultsData || [])
        }
      } else {
        setError('暂无计算结果')
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      setError('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!batchInfo || results.length === 0) return

    // 准备导出数据
    const exportData = results.map(result => ({
      '员工姓名': result.employee_name,
      '平均工资': result.avg_salary,
      '缴费基数': result.contribution_base,
      '公司应缴金额': result.company_fee,
      '城市': result.city_name,
      '计算日期': new Date(result.calculation_date).toLocaleDateString()
    }))

    // 添加汇总信息
    exportData.push({
      '员工姓名': '总计',
      '平均工资': '',
      '缴费基数': '',
      '公司应缴金额': batchInfo.total_company_fee,
      '城市': batchInfo.city_name,
      '计算日期': new Date(batchInfo.created_at).toLocaleDateString()
    })

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '社保计算结果')

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 员工姓名
      { wch: 15 }, // 平均工资
      { wch: 15 }, // 缴费基数
      { wch: 15 }, // 公司应缴金额
      { wch: 10 }, // 城市
      { wch: 15 }  // 计算日期
    ]
    ws['!cols'] = colWidths

    // 下载文件
    XLSX.writeFile(wb, `社保计算结果_${batchInfo.city_name}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-500 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">计算结果</h1>
          <p className="mt-2 text-gray-600">查看最新的社保费用计算结果</p>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{error}</h3>
            <p className="mt-2 text-sm text-gray-500">
              请先前往<a href="/upload" className="text-blue-600 hover:text-blue-500">数据管理页面</a>上传数据并执行计算
            </p>
          </div>
        ) : (
          <>
            {/* Batch Info */}
            {batchInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">城市</p>
                    <p className="text-lg font-semibold text-gray-900">{batchInfo.city_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">员工人数</p>
                    <p className="text-lg font-semibold text-gray-900">{batchInfo.total_employees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">公司总费用</p>
                    <p className="text-lg font-semibold text-gray-900">¥{batchInfo.total_company_fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">计算时间</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(batchInfo.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">员工明细</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        员工姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        平均工资
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        缴费基数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        公司应缴金额
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.employee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{result.avg_salary.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{result.contribution_base.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          ¥{result.company_fee.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-6 text-center">
              <button
                onClick={exportToExcel}
                disabled={results.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-6 rounded-md inline-flex items-center transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出Excel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}