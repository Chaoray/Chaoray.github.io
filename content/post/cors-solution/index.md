---
title: "跨域請求限制問題"
description: ""
date: 2023-03-18T15:50:37+08:00
tags: []
categories: ["tutorial"]
image: cred-req-updated.png
---

最近遇到一個問題：**Cors (Cross-Origin Resource Sharing)**

在瀏覽器中開Live-server，fetch其他網域的網站，會跳除如下錯誤
```
Access to fetch at 'https://example.com/' from origin 'http://127.0.0.1:8080' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource. 
If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

被最後一句話騙，乖乖加上`no-cors`後，response是空的....

其實這是瀏覽器內部的限制，為了資安疑慮所設的

目前有兩種主要解決辦法：  
1. 跟伺服器管理員溝通，讓他在response的header中加上`Access-Control-Allow-Origin`
2. 架個proxy，回傳時header加上`Access-Control-Allow-Origin`

已經有人寫好proxy了，隨便找個託管(render、heroku)都可以架  
連結：[Rob--W/cors-anywhere](https://github.com/Rob--W/cors-anywhere/#documentation)

雖然說CORS對網頁開發者是惡夢，不過確實達到安全的目的  
早有耳聞，但是第一次自己遇到還是很新鮮 (汗
