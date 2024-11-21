const path = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);


let mysql = require('mysql2');
let mysql_config = {
    host: "10.39.103.75",
    //host: "sh-cynosdbmysql-grp-7guaff22.sql.tencentcdb.com",
    user: 'root',
    password: 'Wu806806',
    database: 'men_mao_players',
    //port: 22998
    port: 3306
}
let connection = null

function handleDisconnection() {
    connection = mysql.createConnection(mysql_config);
    connection.connect(function (err) {
        if (err) { console.log("connection-connect-err") }
    });
    connection.on('error', function (err) {
        console.log("connection-err")
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnection();
        } else { throw err; }
    });
}
handleDisconnection()


// post写法参考
app.post("/api/report_data", async (req, res) => {
    let data = req.body;
    let sql = "INSERT INTO players (id, name , head , coins , stars) VALUES (\"??\" , \"??\", \"??\" , ?? , ??) ON DUPLICATE KEY UPDATE coins = ?? , stars = ?? ;"
    try {
        let obj = await query(sql, [data.account, data.nickName, data.headUrl, data.diamond, data.moonCount, data.diamond, data.moonCount]);
        if (obj.results) {
            //res.send(getRes(1, "success", obj.results));
            res.send("success");
        } else {
            res.send(getRes(0, "数据错误" + obj));
        }
    } catch (error) {
        res.send(getRes(0, "数据库错误"));
    }
});

app.post('/poxy/*', (req, res) => {
    const targetUrl = 'https://api.weixin.qq.com' + req.url.replace("/poxy/", "/");
    // 构建转发选项
    const options = {
        method: 'POST',
       // headers: req.headers,
        body: JSON.stringify(req.body)
    };
    fetch(targetUrl, options)
        .then(response => response.json())
        .then(data => res.json(data))
        .catch((error) => {
            res.status(500).send(error)
        });
});

app.get("/api/get_data", async (req, res) => {
    let id = req.query.id
    let sql = "SELECT * FROM players where id = \"??\" "
    try {
        let obj = await query(sql, [id]);
        if (obj.results) {
            res.send(getRes(1, "success", obj.results));
        } else {
            res.send(getRes(0, "数据错误" + obj));
        }
    } catch (error) {
        res.send(getRes(0, "数据库错误"));
    }
});

app.get("/api/get_all_data", async (req, res) => {
    let sql = "SELECT * FROM players ORDER BY stars DESC limit 50"
    try {
        let obj = await query(sql, []);
        if (obj.results) {
            res.send(getRes(1, "success", obj.results));
        } else {
            res.send(getRes(0, "数据错误" + obj));
        }
    } catch (error) {
        res.send(getRes(0, "数据库错误"));
    }
});


app.get("/api/get_test", async (req, res) => {
    let sql = 'SELECT * FROM players'
    try {
        let obj = await query(sql, []);
        if (obj.results) {
            res.send(getRes(1, "success", obj.results));
        } else {
            res.send(getRes(0, "数据错误" + obj));
        }
    } catch (error) {
        res.send(getRes(0, "数据库错误"));
    }
});

app.get("/api/manifest", async (req, res) => {
    res.send("success");
});

//get写法参考
// app.get("/api/xixi", async(req, res) => {
//     if (req.query.id) {
//         let sql = 'SELECT * FROM players WHERE  player_id=?'
//         let obj = await asQuery(sql, [req.query.id]);
//         if (obj.results || obj.results[0]) {
//             res.send(getRes(1, "success", obj.results[0]));
//         } else {
//             res.send(getRes(0, "数据库错误"));
//         }
//     } else {
//         res.send(getRes(0, "参数错误"));
//     }
// });

const port = process.env.PORT || 80;

async function bootstrap() {
    // await initDB();
    app.listen(port, () => {
        console.log("启动成功", port);
    });
}

bootstrap();

function replaceQuestionMarks(str, arr) {
    let index = 0;
    while (str.includes("??")) {
        let s = str.replace("??", () => arr[index]);
        index++
        str = s
    }
    return str;
}

function getRes(code = 0, text = "", obj = {}) {
    return { code: code, text: text, obj: obj }
}

async function query(sql, permeter) {
    var promise = new Promise((resolve) => {
        try {
            sql = replaceQuestionMarks(sql, permeter)
            console.log(sql)
            connection.query(sql, permeter, (error, results, fields) => {
                console.log('results', results);
                resolve({ error: error, results: results })
            });
        } catch (error) {
            resolve({ error: error, results: null })
        }
    });
    return promise;
}