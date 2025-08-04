@echo off
echo Starting Browser Tools MCP...

REM 启动服务器
start "Browser Tools Server" cmd /k "npx @agentdeskai/browser-tools-server@latest"

REM 等待服务器启动
timeout /t 5 /nobreak > nul

REM 启动客户端
start "Browser Tools MCP" cmd /k "npx @agentdeskai/browser-tools-mcp@latest"

echo MCP 已启动，请保持这些窗口打开
echo 现在可以开始使用 Cursor 进行开发了
pause 