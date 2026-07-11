# 1. 清理之前的构建
rm -rf dist node_modules/.vite

# 2. 增加 swap
swapoff /swapfile
dd if=/dev/zero of=/swapfile bs=1M count=4096
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 3. 直接使用 vite 构建（跳过 TypeScript）
export NODE_OPTIONS="--max-old-space-size=4096"
npx vite build

# 4. 查看结果
ls -la dist/
