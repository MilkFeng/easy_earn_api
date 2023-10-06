# EasyEarn Server

## 简介

这是EasyEarn平台的服务端

## 结构

```
server
├── rchain: RChain 发行版本和配置文件
│   ├── rnode-release: RNode 发行版文件
│   ├── ...
│   └── config.conf: RNode 配置文件
├── src
│   ├── chat: 用户聊天等操作
│   ├── wallet: 钱包、代币、交易等操作
│   ├── database: 数据库相关操作
│   ├── user: 用户登录、注册、个人信息等用户相关操作
│   └── rho: .rho 文件
├── README.md
└── server.js: 服务端入口
```