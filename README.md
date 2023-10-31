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

部署合约时，会向部署者的钱包初始化一定数量的代币。

如果没有更改配置的话，现在部署者的私钥、公钥、钱包地址分别为：
```
private key: 6b2c9887ce24094087896a0fa3c64e3faec8ad06f16fbe72da3a44463aeca8a9
public key: 045fe473dfecbf8f2c9043ce85380423f860e551c701078879f76b0ab5519074e5f1eac8ea7ebf4d503b36733e388a1774b01b3a8f93d2010a9b66202b97c45ed7
address: 11112gNSU4Ytt3b2TpAQnggARSidPpNxrNkWqFFg52aNe5t6sjCy2c
```

### 启动服务器

```
npm run server
```