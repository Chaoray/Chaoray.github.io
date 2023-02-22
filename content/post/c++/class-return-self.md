---
title: "C++ Class Return Self"
date: 2023-01-15T10:44:46+08:00
draft: false
tags: ["C++", "Class"]
---

Wanna make the class be able to do a chain-call

```cpp
class TextBox {
    string text;

    TextBox addText(const string& append) {
        text += append;
        return this;
    }
};

TextBox textBox1;
textBox1.addText("Text1").addText("Text2").addText("Text3");
```

This is not going to work :P

```cpp
class TextBox {
    string text;

    TextBox& addText(const string& append) {
        text += append;
        return *this;
    }
};

TextBox textBox1;
textBox1.addText("Text1").addText("Text2").addText("Text3");
```
Works fine!

Or you can
```cpp
class TextBox {
    string text;

    TextBox* addText(const string& append) {
        text += append;
        return this;
    }
};

TextBox textBox1;
(*(*textBox1.addText("Text1")).addText("Text2")).addText("Text3");
```
Longer, more verbose.
