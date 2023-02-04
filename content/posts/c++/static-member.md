---
title: "OOP - Static Member"
date: 2023-02-04T21:35:56+08:00
tags: ['class']
draft: false
---

# Preface
I wondered, what if a class, for example `A`, has two methods, one that can only be call when `A` is not a instance, but the other one can only be call when `A` is an instance.

Pseudo Code
```js
class A;
A.do1();
A.do2(); // error

a = new A();
a.do1(); // error
a.do2();
```


I looked up for a while on the Internet, and I found there is actually a thing called **Static Member**. 

# What is a static member
1. There is only **one copy** of that member.
2. It is **initialized when the program start**, even before main starts.
3. It stands for the entire program life.

For example
```cs
using System;

public class A
{
    public static int do1()
    {
        return 1;
    }
    
    public int do2()
    {
        return 2;
    }
}

public class Program
{
    public static void Main()
    {
        Console.WriteLine(A.do1());
        A a = new A();
        Console.WriteLine(a.do2());
    }
}
```

But if I do
```cs
a.do1();
// Member 'A.do1' cannot be accessed with an instance reference; qualify it with a type name instead

A.do2();
// An object reference is required for the non-static field, method, or property 'A.do2()'
```


This is pretty handy when I need to use something that doesn't belong to the instance.  
However, it does belong to the class.  

Like
```cpp
class Window {
    static HWND getActive() {
        return GetActiveWindow();
    }

    RECT getRect() {
        return this.rect;
    }
}
```

ActiveWindow is not a part of current window; nevertheless, rect is.

Very interesting. :D
