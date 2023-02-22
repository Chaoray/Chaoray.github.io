---
title: "去掉啟用Windows浮水印"
date: 2023-01-20T16:30:19+08:00
tags: ["windows", "trick"]
draft: false
---

用**管理員**開啟cmd後，輸入
```
bcdedit -set TESTSIGNING OFF
```

重啟電腦後就消失了~

<img src="/watermark-removed.jpg">
