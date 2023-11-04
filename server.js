//  _   _ _____     _    ___ ____            ____                           
// | \ | |__  /    / \  |_ _|  _ \          / ___|  ___ _ ____   _____ _ __ 
// |  \| | / /    / _ \  | || |_) |  _____  \___ \ / _ \ '__\ \ / / _ \ '__|
// | |\  |/ /_   / ___ \ | ||  _ <  |_____|  ___) |  __/ |   \ V /  __/ |   
// |_| \_/____| /_/   \_\___|_| \_\         |____/ \___|_|    \_/ \___|_|   
// 
// Version 1.1 | By BLxcwg666 <huixcwg@gmail.com> @xcnya / @xcnyacn
// Lastest Update at 2023/11/05 00:07
//「 幻术世界有什么不好，现实太残酷，只会让这空洞越来越大。」

const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv').config();
const fastify = require('fastify')({ logger: false });

const nz_host = process.env.NZ_HOST;
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

fastify.addHook('preHandler', (request, reply, done) => {
  const reqs = ['name', 'tag', 'index', 'note'];
  reqs.forEach(param => {
    if (request.query[param]) {
      request.query[param] = request.query[param].replace(/"/g, '');
    }
  });

  done();
});

fastify.get('/add', async (request, reply) => {
 const { name, tag, index, note } = request.query;
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
    const headers = { 'Cookie': cookies };
    const response1 = await axios.post(`${nz_host}/api/server`, request1, { headers });
    if (response1.status !== 200) {
      throw new Error('Request 1 failed');
    }

    const response2 = await axios.get(`${nz_host}/api/v1/server/list?tag=${tempTag}`, { headers });
    if (response2.status !== 200) {
      throw new Error('Request 2 failed');
    }

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
      if (response3.status !== 200) {
        throw new Error('Request 3 failed');
      } else {
        reply.code(200).send({ "code": "200", "msg": "OK", "secret": `${secret}` })
      }
    }
  } catch (error) {
    console.error(error);
    reply.code(500).send({ "code": "500", "msg": "出错了呜呜呜~ 请检查控制台输出喵~" });
  }
});

fastify.listen({ port: 8000 }, (err) => {
  if (err) throw err;
  console.log('Server is listening on port 8000');
});
