高清剧集大全 静态电影网站

生成内容：
- index.html 首页，包含首屏 Hero 轮播。
- categories.html 分类总览。
- rankings.html 排行榜。
- search.html 客户端搜索/筛选。
- all/ 分页片库。
- category/ 独立分类页。
- detail/ 共 2000 个影片详情页，每个详情页包含 HLS 播放器区域。

图片路径：
页面已按要求引用网站顶级目录下的 1.jpg 到 150.jpg。上传包中未包含这些 JPG 文件，因此部署时可直接把 1.jpg 至 150.jpg 放在网站根目录。

播放源：
已从上传 JS 中提取 20 条 m3u8 播放源，并循环绑定到详情页播放器。

部署方式：
把本 ZIP 解压到任意静态网站空间即可访问。HLS 播放建议通过 HTTP/HTTPS 服务器访问，不建议直接用 file:// 打开。
