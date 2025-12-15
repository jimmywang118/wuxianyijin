import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { cityName: string } }
) {
  try {
    const cityName = params.cityName

    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .eq('city_name', cityName)
      .order('year', { ascending: false })
      .limit(1)

    if (error) {
      console.error('查询城市数据失败:', error)
      return NextResponse.json(
        { success: false, error: '查询城市数据失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('获取城市数据出错:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}