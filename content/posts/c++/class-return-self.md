---
title: "C++ Class回傳自己"
date: 2023-01-15T10:44:46+08:00
draft: false
tags: ["C++", "Class"]
---

想要讓Class可以一直擴展下去
```cpp
class TextBox {
    string text;

    TextBox addText(const string& append) {
        text += append;
        return this;
    }
};

TextBox textBox1();
textBox1.addText("Text1").addText("Text2").addText("Text3");
```
結果？報錯，在C++中這樣寫行不通

```cpp
class TextBox {
    string text;

    TextBox& addText(const string& append) {
        text += append;
        return *this;
    }
};
```
改成這樣就可以
