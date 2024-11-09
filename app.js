const axios = require('axios');
const https = require('https');
const express = require('express');
const cheerio = require('cheerio');
const app = express();
const port = 3000;
// 创建 axios 实例
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Referer: 'https://developer.lanzoug.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        'Cookie': "down_ip=1; expires=Sat, 16-Nov-2019 11:42:54 GMT; path=/; domain=.baidupan.com",
        'X-Forwarded-For': randIP(),
        'CLIENT-IP': randIP(),
        // 其他自定义头部可以在这里添加
    },
    withCredentials: true
});

// 路由 - 处理文件下载请求 
// http://localhost:3000/api/lz?url=http://www.lanzoui.com/isXBO2el56fe //无密码
//http://localhost:3000/api/lz?url=https://wwd.lanzouw.com/i3Ya2065bn0b&pwd=6ye7 //有密码
app.get('/api/lz', async (req, res) => {
    const { url, pwd } = req.query;
    if (!url) {
        return res.status(400).json({ error: '缺少URL参数' });
    }
    try {
        const response = await axiosInstance.get(url);
        const { file, ...args } = parseHTMLInfo(response.data);

        const signData = await getSign(response.data, pwd, url);

        // POST 请求
        const postResponse = await axiosInstance.post(`https://${getDomain(url)}/ajaxm.php?file=${file}`, signData, {
            headers: {
                Referer: 'https://developer.lanzoug.com',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const downloadUrl = `${postResponse.data.dom}/file/${postResponse.data.url}`;
        const finalResponse = await axiosInstance.get(downloadUrl);
        return res.send({
            data: {
                url: finalResponse.request.res.responseUrl,
                other: {
                    ...args
                },
            }
        })
        // res.json({ downloadUrl: finalResponse.request.res.responseUrl });
    } catch (error) {
        return res.send({ code: -1, msg: "检查密码是否正确,或请求失败 ERR:" + error })
    }
});

// 获取文件的 sign
async function getSign(html, pw, url) {
    const dft = { action: "downprocess", kd: 1 };
    const $ = cheerio.load(html);
    let signValue = '';

    // 查找包含 sign 值的脚本
    $('script').each((index, element) => {
        const scriptContent = $(element).html();
        const signMatch = scriptContent.match(/var skdklds = '(.*?)';/);
        if (signMatch) {
            signValue = signMatch[1];
        }
    });
    if (!pw) {
        //不需要密码的情况
        let key = $('.n_downlink').attr('src');

        const subPageResponse = await axiosInstance.get(`https://${getDomain(url)}${key}`);
        const $2 = cheerio.load(subPageResponse.data);

        $2('script').each((index, element) => {
            const scriptContent = $2(element).html();
            const signMatch = scriptContent.match(/'sign':'(.*?)'/);
            if (signMatch) {
                signValue = signMatch[1];
            }
        });
        return { ...dft, signs: "?ctdf", sign: signValue };
    } else {
        return { ...dft, sign: signValue, p: pw };
    }
}

// 解析 HTML 信息
function parseHTMLInfo(html) {

    const $ = cheerio.load(html);

    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const filename = $('.n_box_3fn').text().trim() || '';
    const filesize = $('.n_filesize').text().replace('大小：', '').trim() || '';
    const uploadTime = $('.n_file_info .n_file_infos').first().text().trim() || '';
    const uploader = $('.user-name').text().trim() || '';
    const file = $('a.n_login').attr('href').match(/f=(\d+)/)[1] || '';
    const src = $('.filename img').attr('src') || '';
    const userIconStyle = $('.user-ico-img').attr('style') || '';
    let avatarUrl = ''
    const regex = /url\(\s*(['"]?)(https?:\/\/[^\s'"]+)\1\s*\)/;
    const match = userIconStyle.match(regex);
    if (match && match[2]) {
        avatarUrl = match[2]
    }
    return {
        file,
        title,
        description,
        filename,
        filesize,
        uploadTime,
        uploader,
        src,
        avatarUrl
    };
}

// 获取 URL 的域名
function getDomain(url) {
    return url.split('/')[2];
}
function randIP() {
    function r() { return Math.round(Math.random() * (2550000 - 600000) + 600000) % 256 }
    const ip2id = r(); // 获取 0-255 之间的值
    const ip3id = r(); // 获取 0-255 之间的值
    const ip4id = r(); // 获取 0-255 之间的值
    const arr_1 = ["218", "218", "66", "66", "218", "218", "60", "60", "202", "204", "66", "66", "66", "59", "61", "60", "222", "221", "66", "59", "60", "60", "66", "218", "218", "62", "63", "64", "66", "66", "122", "211"];
    const randIndex = Math.floor(Math.random() * arr_1.length);
    const ip1id = arr_1[randIndex];
    return `${ip1id}.${ip2id}.${ip3id}.${ip4id}`;
}



// 启动 Express 服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});