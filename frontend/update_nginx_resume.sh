#!/bin/bash

echo "=== 更新 Nginx Resume 配置 ==="

# 备份原配置
echo "1. 备份原配置..."
cp /etc/nginx/conf.d/ibnlus.com.conf /etc/nginx/conf.d/ibnlus.com.conf.bak.$(date +%Y%m%d_%H%M%S)

# 修改配置
echo "2. 修改配置..."
sed -i 's|alias /opt/resume-frontend/;|alias /root/workspace/ai-resume-optimizer/frontend/dist/;|g' /etc/nginx/conf.d/ibnlus.com.conf

# 显示修改后的配置
echo ""
echo "3. 修改后的 resume 配置："
echo "================================"
grep -A5 "location /resume/" /etc/nginx/conf.d/ibnlus.com.conf
echo "================================"

# 测试配置
echo ""
echo "4. 测试 Nginx 配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ 配置测试通过"
    
    # 重载 Nginx
    echo "5. 重载 Nginx..."
    nginx -s reload
    echo "✅ Nginx 重载成功"
    
    # 测试访问
    echo ""
    echo "6. 测试访问..."
    curl -I https://www.ibnlus.com/resume/ 2>/dev/null | head -5
    
    echo ""
    echo "✅ 部署完成！"
    echo "访问: https://www.ibnlus.com/resume/"
else
    echo "❌ 配置测试失败，请检查"
    # 恢复备份
    echo "恢复备份中..."
    cp /etc/nginx/conf.d/ibnlus.com.conf.bak.* /etc/nginx/conf.d/ibnlus.com.conf 2>/dev/null
    nginx -t && nginx -s reload
fi
