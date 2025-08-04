# Browser Tools MCP 自动启动脚本
Write-Host "🚀 启动 Browser Tools MCP..." -ForegroundColor Green

# 检查是否已经运行
$serverProcess = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*browser-tools-server*" }
$clientProcess = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*browser-tools-mcp*" }

if ($serverProcess) {
    Write-Host "⚠️  MCP 服务器已在运行" -ForegroundColor Yellow
} else {
    Write-Host "📡 启动 MCP 服务器..." -ForegroundColor Blue
    Start-Process -FilePath "npx" -ArgumentList "@agentdeskai/browser-tools-server@latest" -WindowStyle Normal
}

# 等待服务器启动
Write-Host "⏳ 等待服务器启动..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

if ($clientProcess) {
    Write-Host "⚠️  MCP 客户端已在运行" -ForegroundColor Yellow
} else {
    Write-Host "🔧 启动 MCP 客户端..." -ForegroundColor Blue
    Start-Process -FilePath "npx" -ArgumentList "@agentdeskai/browser-tools-mcp@latest" -WindowStyle Normal
}

Write-Host "✅ MCP 启动完成！" -ForegroundColor Green
Write-Host "💡 提示：保持这些窗口打开，MCP 将持续工作" -ForegroundColor Cyan
Write-Host "🔄 如需重启，请关闭所有 MCP 窗口后重新运行此脚本" -ForegroundColor Yellow

Read-Host "按回车键退出" 