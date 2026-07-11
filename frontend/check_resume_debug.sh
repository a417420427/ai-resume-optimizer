cat > check_resume_debug.sh << 'EOF'
#!/bin/bash

echo "========================================="
echo "=== Resume 重定向问题诊断脚本 ==="
echo "========================================="
echo ""

# 1. 检查前端构建
echo "1. 检查 index.html 中的资源路径:"
echo "----------------------------------------"
cat /root/workspace/ai-resume-optimizer/frontend/dist/index.html | head -30
echo ""

# 2. 检查 vite.config.ts
echo "2. 检查 vite.config.ts 的 base 配置:"
echo "----------------------------------------"
cat /root/workspace/ai-resume-optimizer/frontend/vite.config.ts 2>/dev/null | grep -E "base|BASE_URL" || echo "未找到 vite.config.ts"
echo ""

# 3. 检查 Nginx 当前配置
echo "3. 当前 Nginx 中 /resume 相关配置:"
echo "----------------------------------------"
grep -A10 "location /resume" /etc/nginx/conf.d/ibnlus.com.conf
echo ""

# 4. 检查 dist 目录文件
echo "4. dist 目录文件列表:"
echo "----------------------------------------"
ls -la /root/workspace/ai-resume-optimizer/frontend/dist/
echo ""

# 5. 检查是否有 assets 目录
echo "5. assets 目录内容:"
echo "----------------------------------------"
ls -la /root/workspace/ai-resume-optimizer/frontend/dist/assets/ 2>/dev/null | head -20
echo ""

# 6. 检查前端路由
echo "6. 检查前端路由配置:"
echo "----------------------------------------"
grep -r "BrowserRouter\|createBrowserRouter\|HashRouter\|Router" /root/workspace/ai-resume-optimizer/frontend/src/ 2>/dev/null | head -10 || echo "未找到路由配置"
echo ""

# 7. 测试访问
echo "7. 测试访问 /resume/:"
echo "----------------------------------------"
curl -I https://www.ibnlus.com/resume/ 2>/dev/null | head -10
echo ""

# 8. 测试访问 /resume
echo "8. 测试访问 /resume (不带斜杠):"
echo "----------------------------------------"
curl -I https://www.ibnlus.com/resume 2>/dev/null | head -10
echo ""

# 9. 检查浏览器重定向链（模拟）
echo "9. 模拟重定向链（使用 curl -L）:"
echo "----------------------------------------"
curl -L -s -o /dev/null -w "重定向链: %{url_effective}\n" https://www.ibnlus.com/resume/ 2>/dev/null || echo "请求失败"
echo ""

# 10. 检查 Nginx 错误日志
echo "10. 最近 Nginx 错误日志:"
echo "----------------------------------------"
tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i "resume\|redirect" || echo "无相关错误"
echo ""

echo "========================================="
echo "=== 诊断完成 ==="
echo "========================================="
EOF
