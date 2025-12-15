'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface BatchRecord {
  id: string
  city_name: string
  total_employees: number
  total_company_fee: number
  description?: string
  created_at: string
}

export default function HistoryPage() {
  const [batches, setBatches] = useState<BatchRecord[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [batchResults, setBatchResults] = useState<{ [key: string]: any[] }>({})

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    if (selectedCity) {
      fetchHistory(selectedCity)
    } else {
      fetchHistory()
    }
  }, [selectedCity])

  const fetchHistory = async (cityFilter?: string) => {
    try {
      setLoading(true)

      // 获取所有批次记录
      let query = supabase
        .from('calculation_batches')
        .select('*')
        .order('created_at', { ascending: false })

      if (cityFilter) {
        query = query.eq('city_name', cityFilter)
      }

      const { data: batchesData, error: batchesError } = await query

      if (batchesError) {
        console.error('获取历史记录失败:', batchesError)
        return
      }

      setBatches(batchesData || [])

      // 获取所有城市列表用于筛选
      if (!cityFilter) {
        const uniqueCities = [...new Set(batchesData?.map(b => b.city_name) || [])]
        setCities(uniqueCities)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBatchResults = async (batchId: string) => {
    if (batchResults[batchId]) {
      // 如果已经加载过，直接切换显示状态
      setExpandedBatch(expandedBatch === batchId ? null : batchId)
      return
    }

    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('batch_id', batchId)
        .order('employee_name')

      if (error) {
        console.error('获取批次结果失败:', error)
        return
      }

      setBatchResults(prev => ({
        ...prev,
        [batchId]: data || []
      }))
      setExpandedBatch(batchId)
    } catch (error) {
      console.error('加载批次结果失败:', error)
    }
  }

  if (loading && batches.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
          <p className="mt-2 text-gray-600">查看所有历史计算批次</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">城市筛选：</label>
            <select
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">全部城市</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              共 {batches.length} 条记录
            </span>
          </div>
        </div>

        {/* History List */}
        {batches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {selectedCity ? '该城市暂无历史记录' : '暂无历史记录'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              还没有执行过计算，请先前往<a href="/upload" className="text-blue-600 hover:text-blue-500">数据管理页面</a>进行操作
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-sm text-gray-600">城市</p>
                          <p className="text-lg font-semibold text-gray-900">{batch.city_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">员工人数</p>
                          <p className="text-lg font-semibold text-gray-900">{batch.total_employees}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">公司总费用</p>
                          <p className="text-lg font-semibold text-gray-900">¥{batch.total_company_fee.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">计算时间</p>
                          <p className="text-sm text-gray-900">
                            {new Date(batch.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {batch.description && (
                        <p className="mt-2 text-sm text-gray-600">{batch.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => fetchBatchResults(batch.id)}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      {expandedBatch === batch.id ? '收起详情' : '查看详情'}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedBatch === batch.id && batchResults[batch.id] && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">员工明细</h3>
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
                            {batchResults[batch.id].map((result, index) => (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}