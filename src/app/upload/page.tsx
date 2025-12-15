'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<'cities' | 'salaries'>('cities')

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
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">点击上传或拖拽文件到此处</p>
                <p className="text-xs text-gray-500 mt-1">支持 .xlsx 格式</p>
                <input type="file" className="hidden" accept=".xlsx" />
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>格式说明：</strong>Excel文件应包含城市名称、年份、缴费基数下限、基数上限和费率等字段
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">员工工资数据</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">点击上传或拖拽文件到此处</p>
                <p className="text-xs text-gray-500 mt-1">支持 .xlsx 格式</p>
                <input type="file" className="hidden" accept=".xlsx" />
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>格式说明：</strong>Excel文件应包含员工工号、姓名、月份（YYYYMM格式）和工资金额等字段
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
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">请先上传城市数据</option>
              </select>
            </div>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
            >
              请先上传数据
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}