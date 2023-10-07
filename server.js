const express = require('express');
const morgan = require('morgan');
const winston = require('winston');

const app = express();

// 配置Express中间件
app.use(express.json());

const default_logger_format = winston.format.combine(
    winston.format.timestamp({
        format: 'DD/MMM/YYYY:HH:mm:ss ZZ',
    }),
    winston.format.printf(info => `[${info.timestamp}] [${info.level}\t] - ${info.message}`),
);

// winston日志组件，用于记录服务器日志
const logger = winston.createLogger({
    level: 'info', // 默认日志级别
    transports: [
        // 控制台输出，带颜色
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                default_logger_format,
            ),
        }),
        // 文件输出，不带颜色
        new winston.transports.File({
            filename: 'logs/server.log',
            format: default_logger_format,
        }),
    ],
});

// 将 console.log/warn/error 绑定到 logger.info/warn/error 方法
console.log = logger.info.bind(logger);
console.warn = logger.warn.bind(logger);
console.error = logger.error.bind(logger);

// morgan日志组件，用于记录HTTP请求
app.use(morgan(
    'short', {
        stream: {
            write: message => logger.info(message.trim()),
        },
    },
));

// 引入路由
const wallet_router = require('./src/wallet/wallet.js');
const user_router = require('./src/user/user.js');

// 使用路由
app.use('/wallet', wallet_router);
app.use('/user', user_router);

// 检测服务器连接状况
app.get('/', (req, res) => {
    res.send({
        status: 'ok',
    });
});

// 设置API服务器的默认端口为3000，监听端口，启动服务器
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
});