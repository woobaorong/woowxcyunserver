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


let mysql = require('mysql2');
let mysql_config = {
    host: "10.35.103.151:3306",
    //host: "sh-cynosdbmysql-grp-p4zugz24.sql.tencentcdb.com",
    user: 'root',
    password: 'h4XeMCyt',
    database: 'nodejs_demo',
    //port: 26799
    port: '3306'
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





// post写法参考
// app.post("/api/count", async(req, res) => {
//     const { action } = req.body;
//     if (action === "inc") {
//         await Counter.create();
//     } else if (action === "clear") {
//         await Counter.destroy({
//             truncate: true,
//         });
//     }
//     res.send({
//         code: 0,
//         data: await Counter.count(),
//     });
// });



app.get("/api/get_test", async(req, res) => {
    let sql = 'SELECT * FROM player'
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
    while (str.includes("?")) {
        let s = str.replace("?", () => arr[index]);
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