//  _   _ _____     _    ___ ____            ____                           
// | \ | |__  /    / \  |_ _|  _ \          / ___|  ___ _ ____   _____ _ __ 
// |  \| | / /    / _ \  | || |_) |  _____  \___ \ / _ \ '__\ \ / / _ \ '__|
// | |\  |/ /_   / ___ \ | ||  _ <  |_____|  ___) |  __/ |   \ V /  __/ |   
// |_| \_/____| /_/   \_\___|_| \_\         |____/ \___|_|    \_/ \___|_|   
// 
// Version 1.6 | By BLxcwg666 <huixcwg@gmail.com> @xcnya / @xcnyacn
// Lastest Update at 2023/11/10 23:35
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

const version = '1.6';
const nz_host = process.env.NZ_HOST;
const serverToken = process.env.API_TOKEN;
const cookies = "nezha-dashboard=" + process.env.NZ_COOKIE;

function random(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const charIndex = crypto.randomBytes(1)[0] % chars.length;
    result += chars.charAt(charIndex);
  }

  return result;
}

const scriptsFolder = path.join(__dirname, 'Scripts');
  if (!fs.existsSync(scriptsFolder)) {
    fs.mkdirSync(scriptsFolder);
}

fs.readFile('client.sh.example', 'utf8', (err, data) => {
    if (err) {
        return console.error('Error:', err);
    }

    const editData = data.replace(/:::API_HOST:::/g, process.env.API_HOST).replace(/:::API_TOKEN:::/g, process.env.API_TOKEN);

    fs.writeFile('./Scripts/client.sh', editData, { encoding: 'utf8', flag: 'w', EOL: '\n' }, (err) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log('OK');
    });
});


fastify.addHook('onRequest', (request, reply, done) => {
  if (!request.routeOptions.url) {
    reply.code(200).send({ "code": "200", "msg": "API Running", "version": `${version}`});
  }

  done();
});

fastify.addHook('preHandler', (request, reply, done) => {
  const reqs = ['name', 'tag', 'index', 'note', 'token'];
  reqs.forEach(param => {
    if (request.query[param]) {
      request.query[param] = request.query[param].replace(/"/g, '');
    }
  });

  done();
});

fastify.get('/add', async (request, reply) => {
 const { name, tag, index, note, token } = request.query;
  if (token !== serverToken) {
    return reply.code(401).send({ "code": "401", "msg": "Unauthorized" });
  }

  const tempTag = random(5);
  const secret = random(18);

  const request1 = {
    "id": null,
    "name": name,
    "Tag": tempTag,
    "DisplayIndex": null,
    "secret": "",
    "Note": note
  };

  try {
    const headers = { 'Cookie': cookies, 'Content-Type': 'application/json; charset=utf-8' };
    const response1 = await axios.post(`${nz_host}/api/server`, request1, { headers });
    const response2 = await axios.get(`${nz_host}/api/v1/server/list?tag=${tempTag}`, { headers });

    const responseData = response2.data;
    if (responseData.result && responseData.result.length > 0) {
      const id = responseData.result[0].id;
      const request2 = {
        "id": id,
        "name": name,
        "Tag": tag,
        "DisplayIndex": request.query.index === '' ? null : index,
        "secret": secret,
        "Note": note
      };
      console.log(secret);
      const response3 = await axios.post(`${nz_host}/api/server`, request2, { headers });
      reply.code(200).send({ "code": "200", "msg": "OK", "secret": `${secret}` });
    }
  } catch (error) {
    console.error(error);
    reply.code(500).send({ "code": "500", "msg": "出错了呜呜呜~ 请检查控制台输出喵~" });
  }
});

fastify.get('/getScript', async (request, reply) => {
  const token = request.query.token;
  if (token !== serverToken) {
    return reply.code(401).send({ "code": "401", "msg": "Unauthorized" });
  }
  try {
    const script = fs.readFileSync('./Scripts/client.sh', 'utf-8');
    reply.header('Content-Type', 'text/plain; charset=utf-8');

    reply.send(script);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ "code": "500", "msg": "出错了呜呜呜~ 请检查控制台输出喵~" });
  }
});

fastify.listen({ port: process.env.PORT, host: process.env.HOST }, (err) => {
  if (err) throw err;
  console.log('Server startted');
});

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