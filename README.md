# Nezha-AutoInstaller
哪吒探针 Agent 自动化请求面板添加服务器并安装  
警告：该项目为娱乐项目，虽然 Nezha Dashboard 的情况很苛刻，官方仓库也不给 Issues，但是我仍然建议放弃本项目去给官方仓库提 pr  

# 安装
要求环境 `Node.JS ≥ 16`
使用 `npm install` 安装，`node server.js` 启动

# Cookie 获取
确保您已经登录到您的 Nezha Dashboard  
F12 → Application → Cookies → nezha-dashboard
![image](https://github.com/BLxcwg666/Nezha-AutoInstaller/assets/66854530/613db0dd-e27e-41e4-9839-6b63d67b1897)  
![image](https://github.com/BLxcwg666/Nezha-AutoInstaller/assets/66854530/2d8cf28c-9749-4f2d-b633-3a151ff43583)  
将此值填入 `.env` 文件中的 `NZ_COOKIE`

注：Cookie 24h有效，暂无解决办法，故此项目为娱乐项目  

# 配置
将 `.env.example` 重命名为 `.env`
```Text
# 服务器设置
HOST=0.0.0.0                             # 绑定 HOST，127.0.0.1 为仅本机，0.0.0.0 为全部
PORT=80                                  # 绑定端口
API_HOST="http://yourapi.com/add"        # 填入你配置此 API 的域名再加个 /add，要带协议头
API_TOKEN="114514"                       # 随便写，但是要记住

# 哪吒面板设置
NZ_HOST="https://yourhq.example.com"     # 填入你的哪吒面板地址，末尾不要加斜杠
NZ_COOKIE="PihBFyGEBJjvTyHbbahwhBV"      # 填入你的哪吒面板 Cookie
NZ_AGENT="agent.yourhq.com"              # 填入你的 Agent 地址，可以是域名也可以是 IP
NZ_PORT=11451                            # 填入你的 Agent 端口
```

# 使用
访问 `https://nai-api.example.com/getScript?token=<API_TOKEN>` 获取安装脚本  
在服务器上可以直接使用 `wget -O nai.sh https://nai-api.example.com/getScript?token=<API_TOKEN> && bash ./nai.sh`

