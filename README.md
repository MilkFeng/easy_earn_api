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
│   ├── wallet: 钱包、代币、交易等操作
│   ├── database: 数据库相关文件
│   ├── user: 用户登录、注册、个人信息等用户相关操作
│   └── rho: .rho 文件
├── README.md
├── server.js: 服务端入口
└── deploy.js: 部署智能合约
```

## 部署 API 服务器

### 克隆仓库

```
git clone https://github.com/MilkFeng/easy_earn_api
cd easy_earn_api
```

### 安装 Nodejs

移步官网：https://nodejs.org/

### 安装依赖

```
npm install
```

### 启动 RNode 节点

```
npm run rnode
```

### 部署智能合约（只需要一次）

```
npm run deploy
```

部署完后会返回一个 `contract_id`，将它粘贴到 `src/common/rhoopt.js` 中。

### 启动服务器

```
npm run server
```