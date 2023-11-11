//  _   _ _____     _    ___ ____            ____                           
// | \ | |__  /    / \  |_ _|  _ \          / ___|  ___ _ ____   _____ _ __ 
// |  \| | / /    / _ \  | || |_) |  _____  \___ \ / _ \ '__\ \ / / _ \ '__|
// | |\  |/ /_   / ___ \ | ||  _ <  |_____|  ___) |  __/ |   \ V /  __/ |   
// |_| \_/____| /_/   \_\___|_| \_\         |____/ \___|_|    \_/ \___|_|   
// 
// Version 1.8 | By BLxcwg666 <huixcwg@gmail.com> @xcnya / @xcnyacn
// Lastest Update at 2023/11/11 20:45
//「 幻术世界有什么不好，现实太残酷，只会让这空洞越来越大。」

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv').config();
const fastify = require('fastify')({
  http2: process.env.ENABLE_SSL,
  https: {
    allowHTTP1: true,
    cert: fs.readFileSync(process.env.CERT_PATH),
    key: fs.readFileSync(process.env.CERT_KEY_PATH)
  }
});

const version = '1.8';
const nz_host = process.env.NZ_HOST;
const serverToken = process.env.API_TOKEN;
const cookies = "nezha-dashboard=" + process.env.NZ_COOKIE;

// 随机数函数，后面要用
function random(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const charIndex = crypto.randomBytes(1)[0] % chars.length;
    result += chars.charAt(charIndex);
  }

  return result;
}

// 自动创建 Scripts 文件夹
const scriptsFolder = path.join(__dirname, 'Scripts');
  if (!fs.existsSync(scriptsFolder)) {
    console.log("未检测到 Scripts 文件夹，尝试自动创建");
    fs.mkdirSync(scriptsFolder);
}

// 从 example 写入到 getScripts 会用到的地方
fs.readFile('client.sh.example', 'utf8', (err, data) => {
    if (err) {
        return console.error('读取源脚本失败，请确保 client.sh.example 存在');
    }

    const editData = data.replace(/:::API_HOST:::/g, process.env.API_HOST).replace(/:::API_TOKEN:::/g, process.env.API_TOKEN).replace(/:::NZ_AGENT:::/g, process.env.NZ_AGENT).replace(/:::NZ_PORT:::/g, process.env.NZ_PORT);

    fs.writeFile('./Scripts/client.sh', editData, { encoding: 'utf8', flag: 'w', EOL: '\n' }, (err) => {
        if (err) {
            console.error('生成脚本失败：', err);
            return;
        }
        console.log('已自动生成脚本');
    });
});

// 未匹配的路由
fastify.addHook('onRequest', (request, reply, done) => {
  if (!request.routeOptions.url) {
    reply.code(200).send({ "code": "200", "msg": "API Running", "version": `${version}`});
  }

  done();
});

// 过滤双引号
fastify.addHook('preHandler', (request, reply, done) => {
  const reqs = ['name', 'tag', 'index', 'note', 'token'];
  reqs.forEach(param => {
    if (request.query[param]) {
      request.query[param] = request.query[param].replace(/"/g, '');
    }
  });

  done();
});

// 步入正题
fastify.get('/add', async (request, reply) => {
 const { name, tag, index, note, token } = request.query;
  if (token !== serverToken) {  // 鉴权
    return reply.code(401).send({ "code": "401", "msg": "Unauthorized" });
  }

  const tempTag = random(5);  // 随机 Tag，定位 id 用
  const secret = random(18);  // 随机一个 secret

  // 第一个请求，用于添加服务器
  const request1 = {
    "id": null,
    "name": name,
    "Tag": tempTag,
    "DisplayIndex": null,
    "secret": "",
    "Note": note
  };

  try {
    // 请求带上 Cookies
    const headers = { 'Cookie': cookies, 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'NAI/' + version };
    // 发第一次请求
    const response1 = await axios.post(`${nz_host}/api/server`, request1, { headers });
    // 发第二次请求，用于定位 id
    const response2 = await axios.get(`${nz_host}/api/v1/server/list?tag=${tempTag}`, { headers });

    const responseData = response2.data;
    if (responseData.result && responseData.result.length > 0) {
      const id = responseData.result[0].id;  // 接收到服务器 id
      const request2 = {  // 第三次请求
        "id": id,
        "name": name,
        "Tag": tag,
        "DisplayIndex": request.query.index === '' ? null : index,
        "secret": secret,
        "Note": note
      };
      console.log(secret);
      // 发第三次请求，用于修改 secret 为本机生成的 secret
      // 别问为什么，哪吒面板第一次请求不支持自定义 secret，而且没有接口直接获取第一次请求在面板生成的 secret
      const response3 = await axios.post(`${nz_host}/api/server`, request2, { headers });
      reply.code(200).send({ "code": "200", "msg": "OK", "secret": `${secret}` });  // 返回结果
    }
  } catch (error) {
    // 异常处理
    console.error(error);
    reply.code(500).send({ "code": "500", "msg": "出错了呜呜呜~ 请检查控制台输出喵~" });
  }
});

// 获取脚本
fastify.get('/getScript', async (request, reply) => {
  const token = request.query.token;
  if (token !== serverToken) {  // 鉴权
    return reply.code(401).send({ "code": "401", "msg": "Unauthorized" });
  }
  try {  // 发送生成的 client.sh
    const script = fs.readFileSync('./Scripts/client.sh', 'utf-8');
    reply.header('Content-Type', 'text/plain; charset=utf-8');

    reply.send(script);
  } catch (error) {
    // 异常处理
    console.error(error);
    reply.code(500).send({ "code": "500", "msg": "出错了呜呜呜~ 请检查控制台输出喵~" });
  }
});

// 开机
fastify.listen({ port: process.env.PORT, host: process.env.HOST }, (err) => {
  if (err) throw err;
  console.log('Server startted');
});

// 续约 Cookie，暂时未验证是否有效
// async function renewCookie() {
//   try {
//     const renewData = await axios.get(`${nz_host}/api/v1/server/list?tag=sbsbbsjzidhebjsjznznzjsjj`, {
//       headers: {
//         'Cookie': cookies
//       }
//     });
//     console.log(renewData.data);
//   } catch (error) {
//     console.error(error);
//   }
// }

// setInterval(renewCookie, 30 * 60 * 1000);