-- Supabase数据库表结构
-- 请在Supabase项目的SQL编辑器中执行以下SQL语句

-- 1. 城市标准表
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 员工工资表
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL, -- YYYYMM格式
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 计算结果表
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  batch_id TEXT NOT NULL,         -- 批次ID，用于标识每次计算
  city_name TEXT NOT NULL,        -- 城市名称
  employee_name TEXT NOT NULL,    -- 员工姓名
  avg_salary FLOAT NOT NULL,      -- 平均工资
  contribution_base FLOAT NOT NULL, -- 缴费基数
  company_fee FLOAT NOT NULL,     -- 公司应缴金额
  calculation_date TIMESTAMP DEFAULT NOW(), -- 计算日期
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 计算批次表
CREATE TABLE IF NOT EXISTS calculation_batches (
  id TEXT PRIMARY KEY,            -- 批次ID
  city_name TEXT NOT NULL,        -- 城市名称
  calculation_date TIMESTAMP DEFAULT NOW(), -- 计算日期
  total_employees INTEGER,        -- 员工总数
  total_company_fee FLOAT,        -- 公司应缴总额
  description TEXT,               -- 批次描述
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_cities_city_name_year ON cities(city_name, year);
CREATE INDEX IF NOT EXISTS idx_salaries_employee_name ON salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_results_batch_id ON results(batch_id);
CREATE INDEX IF NOT EXISTS idx_results_city_name ON results(city_name);
CREATE INDEX IF NOT EXISTS idx_batches_city_name ON calculation_batches(city_name);
CREATE INDEX IF NOT EXISTS idx_batches_calculation_date ON calculation_batches(calculation_date);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculation_batches_updated_at BEFORE UPDATE ON calculation_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 行级安全策略 (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_batches ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取数据
CREATE POLICY "Allow anonymous read access to cities" ON cities
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to salaries" ON salaries
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to results" ON results
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access to calculation_batches" ON calculation_batches
    FOR SELECT USING (true);

-- 允许匿名用户插入数据（通过服务端）
CREATE POLICY "Allow anonymous insert to cities" ON cities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to salaries" ON salaries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to results" ON results
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to calculation_batches" ON calculation_batches
    FOR INSERT WITH CHECK (true);

-- 允许匿名用户更新数据（通过服务端）
CREATE POLICY "Allow anonymous update to cities" ON cities
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous update to salaries" ON salaries
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous update to calculation_batches" ON calculation_batches
    FOR UPDATE USING (true);

-- 删除操作需要更严格的控制
CREATE POLICY "Allow delete on cities" ON cities
    FOR DELETE USING (true);

CREATE POLICY "Allow delete on salaries" ON salaries
    FOR DELETE USING (true);

-- 创建存储过程用于批量插入和计算
CREATE OR REPLACE FUNCTION calculate_and_save(
  p_batch_id TEXT,
  p_city_name TEXT,
  p_results JSONB,
  p_total_employees INTEGER,
  p_total_company_fee FLOAT,
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- 插入批次信息
  INSERT INTO calculation_batches (
    id,
    city_name,
    total_employees,
    total_company_fee,
    description
  ) VALUES (
    p_batch_id,
    p_city_name,
    p_total_employees,
    p_total_company_fee,
    p_description
  );

  -- 插入计算结果
  INSERT INTO results (
    batch_id,
    city_name,
    employee_name,
    avg_salary,
    contribution_base,
    company_fee
  )
  SELECT
    p_batch_id,
    p_city_name,
    item->>'employee_name',
    (item->>'avg_salary')::FLOAT,
    (item->>'contribution_base')::FLOAT,
    (item->>'company_fee')::FLOAT
  FROM jsonb_array_elements(p_results) as item;
END;
$$ LANGUAGE plpgsql;

-- 插入示例数据（可选）
INSERT INTO cities (city_name, year, base_min, base_max, rate) VALUES
('佛山', '2024', 4546, 26421, 0.14),
('广州', '2024', 5284, 26421, 0.14),
('深圳', '2024', 5284, 26421, 0.14)
ON CONFLICT DO NOTHING;