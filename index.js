const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async(req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});




let mysql = require('mysql2');
let mysql_config = {
    host: "10.35.103.151",
    user: 'root',
    password: 'h4XeMCyt',
    database: 'nodejs_demo',
    timezone: 'utc'
}
let connection = null

function handleDisconnection() {
    connection = mysql.createConnection(mysql_config);
    connection.connect(function(err) {
        if (err) { console.log("connection-connect-err") }
    });
    connection.on('error', function(err) {
        console.log("connection-err")
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnection();
        } else { throw err; }
    });
}
handleDisconnection()





// 更新计数
app.post("/api/count", async(req, res) => {
    const { action } = req.body;
    if (action === "inc") {
        await Counter.create();
    } else if (action === "clear") {
        await Counter.destroy({
            truncate: true,
        });
    }
    res.send({
        code: 0,
        data: await Counter.count(),
    });
});

// 获取计数
app.get("/api/count", async(req, res) => {
    const result = await Counter.count();
    res.send({
        code: 0,
        data: result,
    });
});

app.get("/api/xixi", async(req, res) => {
    const result = await Counter.count();
    res.send({
        code: 0,
        data: "xixi",
    });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async(req, res) => {
    if (req.headers["x-wx-source"]) {
        res.send(req.headers["x-wx-openid"]);
    }
});

const port = process.env.PORT || 80;

async function bootstrap() {
    await initDB();
    app.listen(port, () => {
        console.log("启动成功", port);
    });
}

bootstrap();