#!/bin/bash

install_jq() {
    if command -v apt-get &> /dev/null; then
        sudo apt-get install jq
    elif command -v yum &> /dev/null; then
        sudo yum install jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        echo "[ERROR] 无法确定系统类型或找到合适的包管理器。请手动安装 'jq' 后再运行脚本。"
        exit 1
    fi
}

if ! command -v jq &> /dev/null; then
    echo "[STEP 0] 没有检测到 jq，尝试自动安装"
    install_jq
fi

echo "[STEP 1] 设置该服务器信息，不设置请留空"
read -p "指定服务器名: " name
read -p "指定服务器 Tag: " tag
read -p "指定服务器顺序: " index
read -p "指定服务器备注: " note

api_url="https://yuanshen.com/add"
api_token="114514"
query_string="name=$name&tag=$tag&index=$index&note=$note&token=$api_token"

echo "[STEP 2] 请求 API"
response=$(curl -s -H "Content-Type: application/json; charset=utf-8" "$api_url?$query_string")

if [ $? -eq 0 ]; then
    code=$(echo "$response" | jq -r '.code')
    msg=$(echo "$response" | jq -r '.msg')
    secret=$(echo "$response" | jq -r '.secret')
    
    if [ "$secret" != "null" ]; then
        echo "[STEP 3] API 返回 Secret：$secret"

        # 在这里可以执行下一个命令，使用 $secret 作为变量
        # 例如：echo "下一个命令的参数为 $secret"
    else
        echo "[ERROR] API 请求失败：$code - $msg"
    fi
else
    echo "[ERROR] API 请求失败。"
fi