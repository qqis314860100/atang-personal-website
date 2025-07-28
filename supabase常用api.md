很好的问题！让我详细介绍 Supabase 的常用 API 及其组合使用方式。

## �� Supabase 常用 API 详解

### 1. **基础查询 API**

#### `.from(tableName)`

**作用**：指定要操作的表

```typescript
supabase.from('users')
```

#### `.select(columns?)`

**作用**：查询数据，指定返回字段

```typescript
// 查询所有字段
.select()

// 查询指定字段
.select('id, name, email')

// 查询关联数据
.select(`
  id,
  name,
  posts (
    id,
    title
  )
`)
```

#### `.insert(data)`

**作用**：插入数据

```typescript
// 插入单条记录
.insert({ name: 'John', email: 'john@example.com' })

// 插入多条记录
.insert([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
])
```

#### `.update(data)`

**作用**：更新数据

```typescript
.update({ name: 'John Updated' })
```

#### `.delete()`

**作用**：删除数据

```typescript
.delete()
```

### 2. **条件查询 API**

#### `.eq(column, value)`

**作用**：等于条件

```typescript
.eq('status', 'active')
```

#### `.neq(column, value)`

**作用**：不等于条件

```typescript
.neq('status', 'inactive')
```

#### `.gt(column, value)` / `.gte(column, value)`

**作用**：大于 / 大于等于

```typescript
.gt('age', 18)
.gte('price', 100)
```

#### `.lt(column, value)` / `.lte(column, value)`

**作用**：小于 / 小于等于

```typescript
.lt('age', 65)
.lte('price', 1000)
```

#### `.like(column, pattern)`

**作用**：模糊匹配

```typescript
.like('name', '%john%')
```

#### `.ilike(column, pattern)`

**作用**：不区分大小写的模糊匹配

```typescript
.ilike('name', '%john%')
```

#### `.in(column, values)`

**作用**：在指定值列表中

```typescript
.in('status', ['active', 'pending'])
```

### 3. **排序和分页 API**

#### `.order(column, options?)`

**作用**：排序

```typescript
// 升序
.order('created_at', { ascending: true })

// 降序
.order('created_at', { ascending: false })

// 多字段排序
.order('status', { ascending: true })
.order('created_at', { ascending: false })
```

#### `.range(from, to)`

**作用**：分页查询

```typescript
// 获取第1-10条记录
.range(0, 9)

// 获取第11-20条记录
.range(10, 19)
```

#### `.limit(count)`

**作用**：限制返回记录数

```typescript
.limit(10)
```

### 4. **聚合和分组 API**

#### `.select('count(*)')`

**作用**：计数

```typescript
.select('count(*)')
```

#### `.select('sum(price)')`

**作用**：求和

```typescript
.select('sum(price)')
```

#### `.select('avg(price)')`

**作用**：平均值

```typescript
.select('avg(price)')
```

### 5. **关联查询 API**

#### `.select(`

**作用**：关联查询

```typescript
// 查询用户及其文章
.select(`
  id,
  name,
  posts (
    id,
    title,
    content
  )
`)

// 嵌套关联
.select(`
  id,
  name,
  posts (
    id,
    title,
    comments (
      id,
      content
    )
  )
`)
```

### 6. **结果处理 API**

#### `.single()`

**作用**：返回单条记录

```typescript
.select().single() // 返回对象或 null
```

#### `.maybeSingle()`

**作用**：返回单条记录，不抛出错误

```typescript
.select().maybeSingle() // 返回对象或 null，不抛出错误
```

## 🔗 常用组合模式

### 1. **查询组合**

```typescript
// 复杂查询
const { data, error } = await supabase
  .from('posts')
  .select(
    `
    id,
    title,
    content,
    author:users(name, email),
    comments(count)
  `
  )
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .order('created_at', { ascending: false })
  .range(0, 9)
```

### 2. **插入并返回**

```typescript
// 插入并返回完整记录
const { data, error } = await supabase
  .from('users')
  .insert({
    name: 'John',
    email: 'john@example.com',
  })
  .select()
  .single()
```

### 3. **更新并返回**

```typescript
// 更新并返回更新后的记录
const { data, error } = await supabase
  .from('users')
  .update({ name: 'John Updated' })
  .eq('id', userId)
  .select()
  .single()
```

### 4. **条件删除**

```typescript
// 条件删除
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('author_id', userId)
  .eq('status', 'draft')
```

### 5. **分页查询**

```typescript
// 分页查询
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .range(page * pageSize, (page + 1) * pageSize - 1)
```

### 6. **搜索查询**

```typescript
// 搜索功能
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
  .eq('status', 'published')
  .order('created_at', { ascending: false })
```

## 🎯 实际应用案例

### 1. **用户管理**

```typescript
// 获取用户列表
const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(20)
  return { data, error }
}

// 创建用户
const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()
  return { data, error }
}
```

### 2. **博客系统**

```typescript
// 获取文章列表
const getPosts = async (page = 0) => {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id,
      title,
      excerpt,
      created_at,
      author:users(name, avatar)
    `
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(page * 10, (page + 1) * 10 - 1)
  return { data, error }
}
```

### 3. **电商系统**

```typescript
// 获取产品列表
const getProducts = async (category, minPrice, maxPrice) => {
  let query = supabase.from('products').select('*').eq('status', 'active')

  if (category) query = query.eq('category', category)
  if (minPrice) query = query.gte('price', minPrice)
  if (maxPrice) query = query.lte('price', maxPrice)

  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}
```

## 💡 最佳实践

### 1. **错误处理**

```typescript
const { data, error } = await supabase.from('table').select()
if (error) {
  console.error('查询失败:', error)
  return null
}
return data
```

### 2. **类型安全**

```typescript
interface User {
  id: string
  name: string
  email: string
}

const { data, error } = await supabase
  .from('users')
  .select('id, name, email')
  .single()

const user: User | null = data
```

### 3. **性能优化**

```typescript
// 只选择需要的字段
.select('id, name, email') // 而不是 select('*')

// 使用分页
.range(0, 9)

// 使用索引字段进行查询
.eq('id', userId) // 而不是 .like('name', '%john%')
```

这些 API 可以灵活组合，构建出强大的数据查询和操作功能！🎉
