# 蓝奏云 文件下载 API

这个项目是一个基于 Express.js 的应用程序，充当 蓝奏云（一个中国文件共享平台）上的文件下载 API。它允许用户通过提供 URL 来下载文件。

## 特性

- 通过提供 URL 来下载 蓝奏云 上的文件，可选择性地包括密码。
- 从页面的 HTML 中抓取必要信息以便于下载。
- 支持 HTTP 和 HTTPS 请求，支持自定义请求头，并能够绕过 SSL 证书验证。

## 安装

1. 克隆这个仓库：

   ```bash
   git clone https://github.com/longan2244/Lanzou_API
   cd Lanzou_API
   ```

2. 安装依赖：

   ```bash
   npm install or yarn install
   ```

## 使用

### 启动服务器

运行以下命令以启动服务器：

```bash
node app.js
```

服务器将启动并监听在 3000 端口。您可以通过 `http://localhost:3000` 访问它。

### API 接口

**GET** `/api/lz`

#### 参数

- **url** (必需)  蓝奏云 上文件的 URL。
- **pwd** (可选)：如果文件受到密码保护，提供密码。

#### 示例请求

1. **无密码**

   ```http
   GET http://localhost:3000/api/lz?url=http://www.lanzoui.com/isXBO2el56fe
   ```

2. **有密码**

   ```http
   GET http://localhost:3000/api/lz?url=https://wwd.lanzouw.com/i3Ya2065bn0b&pwd=6ye7
   ```

### 响应

在成功请求后，您将收到一个 JSON 响应，其中包含下载链接和其他相关文件信息：

```json
{
    "data": {
        "url": "download_link_here",
        "other": {
            "title": "文件标题",
            "description": "文件描述",
            "filename": "example.txt",
            "filesize": "10MB",
            "uploadTime": "2021-01-01 10:00:00",
            "uploader": "上传者名称",
            "src": "image_url_here",
            "avatarUrl": "avatar_url_here"
        }
    }
}
```

如果发生错误（例如，缺少 URL 参数或密码不正确），将返回：

```json
{
    "error": "您的错误信息在这里"
}
```

## 依赖

- `axios`: 基于 Promise 的浏览器和 Node.js HTTP 客户端。
- `express`: 快速、无偏见、极简的 Node.js Web 框架。
- `cheerio`: 类 jQuery 的服务器端 HTML 解析库。
- `https`: Node.js 中用于发起 HTTPS 请求的内置模块。

## 许可证

该项目授权使用 MIT 许可证。

---

