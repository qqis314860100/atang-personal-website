# Next.js 项目部署到阿里云服务器完整指南

## 目录

1. [服务器准备](#服务器准备)
2. [环境配置](#环境配置)
3. [项目部署](#项目部署)
4. [域名和 SSL](#域名和-ssl)
5. [性能优化](#性能优化)
6. [监控和维护](#监控和维护)
7. [常见问题](#常见问题)

## 服务器准备

### 1. 购买阿里云 ECS 实例

**推荐配置：**

- **CPU**: 2 核以上
- **内存**: 4GB 以上
- **系统盘**: 40GB 以上
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 8
- **带宽**: 5Mbps 以上

**安全组配置：**

```bash
# 开放端口
22    # SSH
80    # HTTP
443   # HTTPS
3000  # Next.js 开发端口（可选）
```

### 2. 连接服务器

```bash
# 使用 SSH 连接
ssh root@your-server-ip

# 或者使用密钥文件
ssh -i your-key.pem root@your-server-ip
```

## 环境配置

### 1. 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. 安装 Node.js

```bash
# 方法1: 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 方法2: 使用 nvm（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# 验证安装
node --version
npm --version
```

### 3. 安装 PM2 进程管理器

```bash
npm install -g pm2
```

### 4. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. 安装 Git

```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS/RHEL
sudo yum install git -y
```

## 项目部署

### 1. 创建部署目录

```bash
# 创建项目目录
sudo mkdir -p /var/www/nextjs-app
sudo chown $USER:$USER /var/www/nextjs-app
cd /var/www/nextjs-app
```

### 2. 克隆项目

```bash
# 克隆你的项目
git clone https://github.com/your-username/your-nextjs-project.git .

# 或者使用 SSH
git clone git@github.com:your-username/your-nextjs-project.git .
```

### 3. 安装依赖

```bash
# 安装依赖
npm install

# 如果是生产环境，使用
npm ci --only=production
```

### 4. 环境变量配置

```bash
# 创建环境变量文件
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

**示例环境变量：**

```env
# 数据库配置
DATABASE_URL=your-database-url

# 认证配置
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# API 配置
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# 其他配置
NODE_ENV=production
```

### 5. 构建项目

```bash
# 构建项目
npm run build

# 验证构建结果
npm start
```

### 6. 配置 PM2

创建 PM2 配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/nextjs-app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/nextjs-app-error.log',
      out_file: '/var/log/pm2/nextjs-app-out.log',
      log_file: '/var/log/pm2/nextjs-app-combined.log',
      time: true,
    },
  ],
}
```

```bash
# 创建日志目录
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# 启动应用
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 7. 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/nextjs-app
```

**配置文件内容：**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # 静态文件缓存
    location /_next/static/ {
        alias /var/www/nextjs-app/.next/static/;
        expires 365d;
        access_log off;
    }

    # 图片和其他静态资源
    location /static/ {
        alias /var/www/nextjs-app/public/static/;
        expires 30d;
        access_log off;
    }

    # API 路由
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 主应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 域名和 SSL

### 1. 域名解析

在阿里云控制台配置域名解析：

- 类型：A 记录
- 主机记录：@ 或 www
- 记录值：你的服务器 IP

### 2. 安装 SSL 证书

**使用 Let's Encrypt（免费）：**

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

**使用阿里云 SSL 证书：**

1. 在阿里云控制台申请 SSL 证书
2. 下载证书文件
3. 配置到 Nginx

### 3. 更新 Nginx 配置（SSL）

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 其他配置保持不变...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 性能优化

### 1. 启用 HTTP/2

```nginx
# 在 Nginx 配置中添加
listen 443 ssl http2;
```

### 2. 配置缓存

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Next.js 构建文件缓存
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 启用 Gzip 压缩

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 4. 配置 PM2 集群模式

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'start',
      instances: 'max', // 使用所有 CPU 核心
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

## 监控和维护

### 1. 日志管理

```bash
# 查看 PM2 日志
pm2 logs nextjs-app

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看应用日志
tail -f /var/log/pm2/nextjs-app-out.log
```

### 2. 性能监控

```bash
# 安装监控工具
npm install -g pm2-server-monit

# 启动监控
pm2-server-monit
```

### 3. 自动部署脚本

创建部署脚本 `deploy.sh`：

```bash
#!/bin/bash

# 部署脚本
echo "开始部署..."

# 进入项目目录
cd /var/www/nextjs-app

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建项目
npm run build

# 重启 PM2
pm2 restart nextjs-app

echo "部署完成！"
```

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署
./deploy.sh
```

### 4. 备份策略

```bash
# 创建备份脚本
#!/bin/bash
BACKUP_DIR="/backup/nextjs-app"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份项目文件
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/nextjs-app

# 备份数据库（如果有）
# mysqldump -u username -p database_name > $BACKUP_DIR/db_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :3000

# 杀死进程
sudo kill -9 <PID>
```

### 2. 权限问题

```bash
# 修复权限
sudo chown -R $USER:$USER /var/www/nextjs-app
sudo chmod -R 755 /var/www/nextjs-app
```

### 3. 内存不足

```bash
# 查看内存使用
free -h

# 增加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 4. 域名无法访问

```bash
# 检查防火墙
sudo ufw status

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 PM2 状态
pm2 status
```

### 5. SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew --dry-run
```

## 部署检查清单

- [ ] 服务器配置完成
- [ ] Node.js 和 PM2 安装
- [ ] Nginx 配置完成
- [ ] 项目构建成功
- [ ] 环境变量配置
- [ ] 域名解析正确
- [ ] SSL 证书安装
- [ ] 防火墙配置
- [ ] 监控工具安装
- [ ] 备份策略制定

## 总结

通过以上步骤，你可以成功将 Next.js 项目部署到阿里云服务器。记住：

1. **安全性**：定期更新系统和依赖
2. **监控**：设置日志监控和性能监控
3. **备份**：定期备份数据和代码
4. **优化**：根据实际需求调整配置
5. **维护**：定期检查和更新

如果遇到问题，可以查看日志文件或联系技术支持。
