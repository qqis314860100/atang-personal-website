# Playwright 测试框架

这是一个基于 Playwright 的端到端测试框架，用于测试 Next.js 博客应用的功能。

## 目录结构

```
tests/
├── config.js          # 测试配置
├── login.test.js      # 登录/登出测试
├── resume-upload.test.js # 简历上传测试
├── run-tests.js       # 测试运行器
├── utils.js           # 工具函数
└── README.md          # 说明文档
```

## 测试数据

测试数据存放在 `test/data` 目录下：

```
test/data/
├── create-sample-pdf.js  # 生成示例PDF的脚本
└── sample-resume.pdf     # 示例简历PDF文件
```

## 安装依赖

```bash
# 安装测试依赖
npm install playwright pdfkit --save-dev

# 安装Playwright浏览器
npx playwright install

# 生成示例PDF文件
npm run create-test-pdf
```

## 运行测试

在运行测试前，请确保：

1. 您的 Next.js 应用已在本地启动（http://localhost:3000）
2. 测试数据已准备好（示例 PDF 文件）
3. 测试账号可用（在 config.js 中配置）

### 运行所有测试

```bash
npm test
```

### 运行特定测试

```bash
# 运行登录测试
npm run test:login

# 运行简历上传测试
npm run test:resume

# 运行登出测试
npm run test:logout
```

## 测试截图

测试过程中的截图将保存在 `test/screenshots` 目录下，包括：

- 测试开始前的状态
- 测试完成后的状态
- 测试失败时的状态

## 配置说明

您可以在 `tests/config.js` 文件中修改以下配置：

- 测试环境的基础 URL
- 测试账号信息
- 测试文件路径
- 超时设置
- 截图设置

## 添加新测试

要添加新的测试，请遵循以下步骤：

1. 在 `tests` 目录下创建新的测试文件，例如 `new-feature.test.js`
2. 使用工具函数库 (`utils.js`) 编写测试步骤
3. 在 `run-tests.js` 中导入并添加新测试

## 常见问题

### 测试失败时如何调试？

1. 查看控制台输出的错误信息
2. 检查 `test/screenshots` 目录下的失败截图
3. 修改测试代码中的等待时间，可能是页面加载或元素出现需要更长时间
4. 使用 `headless: false` 选项（已默认设置）观察浏览器行为

### 如何处理动态内容？

对于动态变化的内容，可以使用更宽松的选择器，例如：

```javascript
// 使用部分文本匹配
await page.waitForSelector('text="部分文本"')

// 或使用CSS选择器
await page.waitForSelector('.class-name:has-text("部分文本")')
```

### 如何测试不同的语言版本？

修改 `config.js` 中的 `baseUrl` 或在 `navigateTo` 函数中指定不同的语言路径：

```javascript
// 测试英文版
await utils.navigateTo('/en/user/resume')
```

### 如何在 CI 环境中运行测试？

在 CI 环境中，您可能需要使用无头模式运行测试：

```javascript
// 在utils.js的initBrowser函数中修改
browser = await chromium.launch({ headless: true })
```
