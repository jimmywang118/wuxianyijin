'use client'

import Link from 'next/link'

export default function HistoryPage() {
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
            <select className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">全部城市</option>
            </select>
          </div>
        </div>

        {/* No History Message */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">暂无历史记录</h3>
          <p className="mt-2 text-sm text-gray-500">
            还没有执行过计算，请先前往<a href="/upload" className="text-blue-600 hover:text-blue-500">数据管理页面</a>进行操作
          </p>
        </div>
      </div>
    </div>
  )
}