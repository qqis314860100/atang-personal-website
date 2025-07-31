# Zod 从入门到精通完整指南

## 目录

1. [基础概念](#基础概念)
2. [安装和配置](#安装和配置)
3. [基础类型](#基础类型)
4. [复杂类型](#复杂类型)
5. [验证和错误处理](#验证和错误处理)
6. [高级特性](#高级特性)
7. [实际应用场景](#实际应用场景)
8. [最佳实践](#最佳实践)
9. [常见问题](#常见问题)

## 基础概念

### 什么是 Zod？

Zod 是一个 TypeScript 优先的模式声明和验证库，它提供了：

- **类型安全**：编译时类型检查
- **运行时验证**：数据验证和错误处理
- **自动类型推断**：从 schema 自动生成 TypeScript 类型
- **零依赖**：轻量级，无外部依赖

### 核心概念

```typescript
import { z } from 'zod'

// Schema 定义
const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(120),
  email: z.string().email(),
})

// 类型推断
type User = z.infer<typeof UserSchema>

// 运行时验证
const result = UserSchema.safeParse(data)
```

## 安装和配置

### 安装

```bash
npm install zod
# 或
yarn add zod
# 或
pnpm add zod
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 基础类型

### 原始类型

```typescript
import { z } from 'zod'

// 字符串
const stringSchema = z.string()
const emailSchema = z.string().email()
const urlSchema = z.string().url()
const uuidSchema = z.string().uuid()

// 数字
const numberSchema = z.number()
const intSchema = z.number().int()
const positiveSchema = z.number().positive()
const negativeSchema = z.number().negative()

// 布尔值
const booleanSchema = z.boolean()

// 日期
const dateSchema = z.date()

// 空值
const nullSchema = z.null()
const undefinedSchema = z.undefined()
const voidSchema = z.void()

// 任意类型
const anySchema = z.any()
const unknownSchema = z.unknown()
```

### 字面量类型

```typescript
// 字面量
const literalSchema = z.literal('hello')
const numberLiteralSchema = z.literal(42)
const booleanLiteralSchema = z.literal(true)

// 联合类型
const statusSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected'),
])

// 或使用简写
const statusSchema2 = z.enum(['pending', 'approved', 'rejected'])
```

### 可选和默认值

```typescript
// 可选字段
const optionalSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
})

// 默认值
const defaultSchema = z.object({
  name: z.string(),
  age: z.number().default(18),
  isActive: z.boolean().default(true),
})

// 可空字段
const nullableSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullish(), // null 或 undefined
})
```

## 复杂类型

### 对象类型

```typescript
// 基础对象
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
})

// 嵌套对象
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string(),
})

const UserWithAddressSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: AddressSchema,
})

// 部分对象
const PartialUserSchema = UserSchema.partial()

// 必需对象
const RequiredUserSchema = UserSchema.required()

// 选择字段
const UserNameOnlySchema = UserSchema.pick({ name: true, email: true })

// 排除字段
const UserWithoutIdSchema = UserSchema.omit({ id: true })

// 扩展对象
const ExtendedUserSchema = UserSchema.extend({
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
})
```

### 数组类型

```typescript
// 基础数组
const stringArraySchema = z.array(z.string())
const numberArraySchema = z.array(z.number())

// 对象数组
const userArraySchema = z.array(UserSchema)

// 数组约束
const limitedArraySchema = z.array(z.string()).min(1).max(10)

// 非空数组
const nonEmptyArraySchema = z.array(z.string()).nonempty()

// 元组
const tupleSchema = z.tuple([z.string(), z.number(), z.boolean()])

// 可变长度元组
const restTupleSchema = z.tuple([z.string(), z.number()]).rest(z.boolean())
```

### 联合和交叉类型

```typescript
// 联合类型
const StringOrNumberSchema = z.union([z.string(), z.number()])

// 简写
const StringOrNumberSchema2 = z.string().or(z.number())

// 交叉类型
const BaseUserSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const UserWithEmailSchema = z.object({
  email: z.string().email(),
})

const FullUserSchema = BaseUserSchema.and(UserWithEmailSchema)
```

### 记录类型

```typescript
// 字符串键值对
const StringRecordSchema = z.record(z.string())

// 特定键值对
const UserRecordSchema = z.record(z.string(), UserSchema)

// 键值约束
const LimitedRecordSchema = z.record(
  z.string().min(1).max(10), // 键的约束
  z.number().positive() // 值的约束
)
```

## 验证和错误处理

### 基础验证

```typescript
// 同步验证
const result = UserSchema.parse(data)
const safeResult = UserSchema.safeParse(data)

// 异步验证
const asyncResult = await UserSchema.parseAsync(data)
const safeAsyncResult = await UserSchema.safeParseAsync(data)
```

### 错误处理

```typescript
const result = UserSchema.safeParse(data)

if (result.success) {
  // 验证成功
  const user = result.data
  console.log('用户数据:', user)
} else {
  // 验证失败
  const errors = result.error.errors
  console.log('验证错误:', errors)

  // 格式化错误信息
  const formattedErrors = result.error.format()
  console.log('格式化错误:', formattedErrors)
}
```

### 自定义错误消息

```typescript
const UserSchema = z.object({
  name: z
    .string({
      required_error: '姓名是必需的',
      invalid_type_error: '姓名必须是字符串',
    })
    .min(2, '姓名至少需要2个字符'),

  email: z.string().email('请输入有效的邮箱地址'),

  age: z
    .number({
      required_error: '年龄是必需的',
      invalid_type_error: '年龄必须是数字',
    })
    .min(0, '年龄不能为负数')
    .max(120, '年龄不能超过120岁'),
})
```

### 错误格式化

```typescript
const result = UserSchema.safeParse(data)

if (!result.success) {
  // 获取所有错误
  const allErrors = result.error.errors

  // 获取特定字段的错误
  const nameErrors = result.error.flatten().fieldErrors.name

  // 获取嵌套错误
  const nestedErrors = result.error.flatten().fieldErrors

  // 获取表单错误
  const formErrors = result.error.flatten().formErrors
}
```

## 高级特性

### 转换和预处理

```typescript
// 字符串转换
const trimmedStringSchema = z.string().trim()
const lowerCaseSchema = z.string().toLowerCase()
const upperCaseSchema = z.string().toUpperCase()

// 数字转换
const coerceNumberSchema = z.coerce.number()
const coerceBooleanSchema = z.coerce.boolean()
const coerceDateSchema = z.coerce.date()

// 自定义转换
const customTransformSchema = z.string().transform((val) => val.toUpperCase())

// 预处理
const preprocessedSchema = z
  .string()
  .preprocess(
    (val) => (typeof val === 'string' ? val.trim() : val),
    z.string().min(1)
  )
```

### 条件验证

```typescript
// 条件字段
const ConditionalUserSchema = z
  .object({
    type: z.enum(['individual', 'company']),
    name: z.string(),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'company') {
        return data.companyName && data.taxId
      }
      return true
    },
    {
      message: '公司类型必须提供公司名称和税号',
      path: ['companyName'], // 错误路径
    }
  )

// 条件验证
const UserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密码不匹配',
    path: ['confirmPassword'],
  })
```

### 自定义验证

```typescript
// 自定义验证函数
const CustomUserSchema = z.object({
  username: z
    .string()
    .refine(
      (val) => /^[a-zA-Z0-9_]+$/.test(val),
      '用户名只能包含字母、数字和下划线'
    ),

  password: z.string().refine((val) => {
    const hasUpperCase = /[A-Z]/.test(val)
    const hasLowerCase = /[a-z]/.test(val)
    const hasNumbers = /\d/.test(val)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val)

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  }, '密码必须包含大小写字母、数字和特殊字符'),

  age: z.number().superRefine((val, ctx) => {
    if (val < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '年龄不能为负数',
      })
    }
    if (val > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '年龄不能超过120岁',
      })
    }
  }),
})
```

### 递归类型

```typescript
// 递归对象
const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    children: z.array(TreeNodeSchema).optional(),
  })
)

// 自引用类型
const CommentSchema: z.ZodType<Comment> = z.lazy(() =>
  z.object({
    id: z.string(),
    content: z.string(),
    author: z.string(),
    replies: z.array(CommentSchema).optional(),
  })
)
```

### 环境变量验证

```typescript
// 环境变量 schema
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  REDIS_URL: z.string().url().optional(),
})

// 验证环境变量
const env = envSchema.parse(process.env)

// 类型推断
type Env = z.infer<typeof envSchema>
```

## 实际应用场景

### 表单验证

```typescript
// React Hook Form 集成
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const LoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
  rememberMe: z.boolean().default(false),
})

type LoginForm = z.infer<typeof LoginSchema>

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    console.log('表单数据:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="checkbox" {...register('rememberMe')} />

      <button type="submit">登录</button>
    </form>
  )
}
```

### API 请求验证

```typescript
// API 响应验证
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
})

const UserResponseSchema = ApiResponseSchema.extend({
  data: UserSchema,
})

// 验证 API 响应
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`)
  const rawData = await response.json()

  const result = UserResponseSchema.safeParse(rawData)

  if (result.success) {
    return result.data.data // 返回用户数据
  } else {
    throw new Error(`API 响应验证失败: ${result.error.message}`)
  }
}
```

### 数据库模型验证

```typescript
// Prisma 模型验证
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(0).max(120).optional(),
  profile: z
    .object({
      bio: z.string().max(500).optional(),
      avatar: z.string().url().optional(),
    })
    .optional(),
})

const UpdateUserSchema = CreateUserSchema.partial()

// 使用验证
async function createUser(data: unknown) {
  const validatedData = CreateUserSchema.parse(data)

  const user = await prisma.user.create({
    data: validatedData,
  })

  return user
}
```

### 配置文件验证

```typescript
// 配置文件 schema
const ConfigSchema = z.object({
  server: z.object({
    port: z.number().int().positive().default(3000),
    host: z.string().default('localhost'),
    cors: z.object({
      origin: z.array(z.string()).default(['http://localhost:3000']),
      credentials: z.boolean().default(true),
    }),
  }),

  database: z.object({
    url: z.string().url(),
    pool: z.object({
      min: z.number().int().positive().default(2),
      max: z.number().int().positive().default(10),
    }),
  }),

  auth: z.object({
    jwtSecret: z.string().min(32),
    expiresIn: z.string().default('7d'),
  }),
})

// 加载和验证配置
function loadConfig(): z.infer<typeof ConfigSchema> {
  const configFile = require('./config.json')
  return ConfigSchema.parse(configFile)
}
```

## 最佳实践

### 1. 类型安全优先

```typescript
// ✅ 好的做法：先定义 schema，再推断类型
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
})

type User = z.infer<typeof UserSchema>

// ❌ 避免：先定义类型，再创建 schema
type User = {
  id: string
  name: string
  email: string
}
```

### 2. 错误消息本地化

```typescript
// 创建错误消息映射
const errorMessages = {
  zh: {
    required: '此字段是必需的',
    invalid_email: '请输入有效的邮箱地址',
    min_length: '至少需要 {min} 个字符',
  },
  en: {
    required: 'This field is required',
    invalid_email: 'Please enter a valid email address',
    min_length: 'At least {min} characters required',
  },
}

// 使用本地化错误消息
const LocalizedUserSchema = z.object({
  name: z
    .string({
      required_error: errorMessages.zh.required,
    })
    .min(2, errorMessages.zh.min_length.replace('{min}', '2')),

  email: z.string().email(errorMessages.zh.invalid_email),
})
```

### 3. 模块化 Schema

```typescript
// 基础 schema
const BaseUserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// 创建用户 schema
const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

// 更新用户 schema
const UpdateUserSchema = CreateUserSchema.partial()

// 完整用户 schema
const UserSchema = BaseUserSchema.merge(CreateUserSchema)

// 导出所有相关类型
export type BaseUser = z.infer<typeof BaseUserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type User = z.infer<typeof UserSchema>
```

### 4. 性能优化

```typescript
// 缓存 schema 实例
const UserSchema = z.object({
  // ... schema 定义
})

// 在模块级别缓存，避免重复创建
export { UserSchema }

// 使用 .parse() 而不是 .safeParse() 当确定数据有效时
// 使用 .safeParse() 当需要处理验证错误时
```

### 5. 测试

```typescript
import { describe, it, expect } from 'vitest'

describe('UserSchema', () => {
  it('应该验证有效的用户数据', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }

    const result = UserSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('应该拒绝无效的邮箱', () => {
    const invalidUser = {
      name: 'John Doe',
      email: 'invalid-email',
      age: 30,
    }

    const result = UserSchema.safeParse(invalidUser)
    expect(result.success).toBe(false)
    expect(result.error.errors[0].message).toContain('邮箱')
  })
})
```

## 常见问题

### Q1: 如何处理可选字段的默认值？

```typescript
// ✅ 推荐做法
const UserSchema = z.object({
  name: z.string(),
  age: z.number().default(18),
  isActive: z.boolean().default(true),
})

// ❌ 避免
const UserSchema = z.object({
  name: z.string(),
  age: z.number().optional().default(18), // 这样会导致类型问题
  isActive: z.boolean().optional().default(true),
})
```

### Q2: 如何验证数组中的唯一值？

```typescript
const UniqueArraySchema = z
  .array(z.string())
  .refine((arr) => arr.length === new Set(arr).size, '数组中的值必须唯一')
```

### Q3: 如何处理动态键值对？

```typescript
const DynamicObjectSchema = z.record(
  z.string(), // 键的类型
  z.union([z.string(), z.number()]) // 值的类型
)
```

### Q4: 如何验证日期范围？

```typescript
const DateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: '结束日期必须晚于开始日期',
    path: ['endDate'],
  })
```

### Q5: 如何处理条件验证？

```typescript
const ConditionalSchema = z
  .object({
    type: z.enum(['individual', 'company']),
    name: z.string(),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'company') {
        return !!data.companyName && !!data.taxId
      }
      return true
    },
    {
      message: '公司类型必须提供公司名称和税号',
      path: ['companyName'],
    }
  )
```

### Q6: 如何验证密码强度？

```typescript
const PasswordSchema = z
  .string()
  .min(8, '密码至少8位')
  .regex(/[A-Z]/, '密码必须包含大写字母')
  .regex(/[a-z]/, '密码必须包含小写字母')
  .regex(/[0-9]/, '密码必须包含数字')
  .regex(/[^A-Za-z0-9]/, '密码必须包含特殊字符')
```

### Q7: 如何处理异步验证？

```typescript
const AsyncEmailSchema = z
  .string()
  .email()
  .refine(async (email) => {
    // 检查邮箱是否已被注册
    const response = await fetch(`/api/check-email?email=${email}`)
    const { available } = await response.json()
    return available
  }, '该邮箱已被注册')
```

### Q8: 如何创建可重用的验证规则？

```typescript
// 创建可重用的验证规则
const createEmailSchema = (checkAvailability = false) => {
  let schema = z.string().email('请输入有效的邮箱地址')

  if (checkAvailability) {
    schema = schema.refine(async (email) => {
      const response = await fetch(`/api/check-email?email=${email}`)
      const { available } = await response.json()
      return available
    }, '该邮箱已被注册')
  }

  return schema
}

// 使用
const RegisterSchema = z.object({
  email: createEmailSchema(true),
  password: PasswordSchema,
})
```

### Q9: 如何处理复杂的嵌套对象？

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string(),
})

const ContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email(),
})

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  addresses: z.array(AddressSchema).min(1, '至少需要一个地址'),
  contacts: z.array(ContactSchema).min(1, '至少需要一个联系方式'),
  metadata: z.record(z.string(), z.unknown()).optional(),
})
```

### Q10: 如何优化错误信息？

```typescript
const UserSchema = z.object({
  name: z
    .string({
      required_error: '姓名是必填项',
      invalid_type_error: '姓名必须是字符串',
    })
    .min(2, '姓名至少2个字符')
    .max(50, '姓名不能超过50个字符'),

  age: z
    .number({
      required_error: '年龄是必填项',
      invalid_type_error: '年龄必须是数字',
    })
    .int('年龄必须是整数')
    .min(0, '年龄不能为负数')
    .max(150, '年龄不能超过150'),

  email: z
    .string({
      required_error: '邮箱是必填项',
    })
    .email('请输入有效的邮箱地址'),
})
```

### Q11: 如何处理联合类型？

```typescript
const StringOrNumberSchema = z
  .union([z.string().transform((val) => parseInt(val, 10)), z.number()])
  .refine((val) => !isNaN(val), '必须是有效的数字')

// 或者使用 discriminated union
const ShapeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('circle'),
    radius: z.number().positive(),
  }),
  z.object({
    type: z.literal('rectangle'),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
])
```

### Q12: 如何创建自定义错误？

```typescript
class CustomZodError extends Error {
  constructor(message: string, public code: string, public field?: string) {
    super(message)
    this.name = 'CustomZodError'
  }
}

const CustomSchema = z.string().refine(
  (val) => val.length > 0,
  () => {
    throw new CustomZodError('字段不能为空', 'EMPTY_FIELD', 'name')
  }
)
```

### Q13: 如何处理国际化错误信息？

```typescript
const createLocalizedSchema = (locale: string) => {
  const messages = {
    zh: {
      required: '此字段为必填项',
      invalid_email: '请输入有效的邮箱地址',
      min_length: '最少需要 {min} 个字符',
    },
    en: {
      required: 'This field is required',
      invalid_email: 'Please enter a valid email address',
      min_length: 'Minimum {min} characters required',
    },
  }

  return z.object({
    name: z
      .string({
        required_error: messages[locale].required,
      })
      .min(2, messages[locale].min_length.replace('{min}', '2')),

    email: z
      .string({
        required_error: messages[locale].required,
      })
      .email(messages[locale].invalid_email),
  })
}
```

### Q14: 如何验证文件上传？

```typescript
const FileSchema = z.object({
  name: z.string(),
  size: z.number().max(5 * 1024 * 1024, '文件大小不能超过5MB'),
  type: z
    .string()
    .refine(
      (type) => ['image/jpeg', 'image/png', 'image/gif'].includes(type),
      '只支持 JPG、PNG、GIF 格式'
    ),
})

const UploadSchema = z.object({
  files: z.array(FileSchema).max(5, '最多上传5个文件'),
})
```

### Q15: 如何处理复杂的业务逻辑验证？

```typescript
const OrderSchema = z
  .object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive(),
      })
    ),
    customer: z.object({
      id: z.string(),
      vipLevel: z.enum(['bronze', 'silver', 'gold', 'platinum']),
    }),
    discountCode: z.string().optional(),
  })
  .refine(
    (order) => {
      const total = order.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      )

      // VIP 客户可以享受折扣
      if (order.customer.vipLevel === 'platinum' && total >= 1000) {
        return true
      }

      // 普通客户需要折扣码才能享受优惠
      if (total >= 500 && !order.discountCode) {
        return false
      }

      return true
    },
    {
      message: '订单金额超过500元需要提供折扣码，或升级为白金会员',
      path: ['discountCode'],
    }
  )
```

### Q16: 如何处理递归数据结构？

```typescript
const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    children: z.array(TreeNodeSchema).optional(),
  })
)

// 或者使用 z.recursive
const CommentSchema = z.recursive((self) =>
  z.object({
    id: z.string(),
    content: z.string(),
    replies: z.array(self).optional(),
  })
)
```

### Q17: 如何验证 API 响应？

```typescript
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
})

const UserApiResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    user: UserSchema,
    token: z.string(),
  }),
})

// 使用
const response = await fetch('/api/user')
const result = UserApiResponseSchema.safeParse(await response.json())
```

### Q18: 如何处理表单验证？

```typescript
const FormSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱'),
    password: z.string().min(8, '密码至少8位'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

// 在 React Hook Form 中使用
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<z.infer<typeof FormSchema>>({
  resolver: zodResolver(FormSchema),
})
```

### Q19: 如何创建环境变量验证？

```typescript
const EnvSchema = z.object({
  DATABASE_URL: z.string().url('数据库URL格式无效'),
  JWT_SECRET: z.string().min(32, 'JWT密钥至少32位'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(65535)),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

// 验证环境变量
const env = EnvSchema.parse(process.env)
```

### Q20: 如何优化大型 Schema 的性能？

```typescript
// 1. 使用 .preprocess() 进行数据预处理
const OptimizedSchema = z.object({
  email: z
    .string()
    .email()
    .preprocess(
      (val) => (typeof val === 'string' ? val.toLowerCase() : val),
      z.string().email()
    ),
  tags: z
    .array(z.string())
    .preprocess(
      (val) => (Array.isArray(val) ? [...new Set(val)] : val),
      z.array(z.string())
    ),
})

// 2. 使用 .transform() 进行数据转换
const TransformSchema = z.object({
  price: z.string().transform((val) => parseFloat(val)),
  date: z.string().transform((val) => new Date(val)),
})

// 3. 缓存验证结果
const cache = new Map()

const validateWithCache = (schema: z.ZodSchema, data: unknown) => {
  const key = JSON.stringify(data)
  if (cache.has(key)) {
    return cache.get(key)
  }

  const result = schema.safeParse(data)
  cache.set(key, result)
  return result
}
```

```

```
