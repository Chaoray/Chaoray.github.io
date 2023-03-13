---
title: "std::thread 使用類別成員函式"
description: ""
date: 2023-03-13T22:07:54+08:00
tags: ["c++"]
categories: ["tutorial"]
image: 7c655da21b075c3b05a09c37e2b44e592f05bcd4f915f63340b94b68194470b8.jpg
---

最近剛好比較有機會碰OOP，想寫個thread卻噴一堆錯誤🙄

```cpp
class Example {
   private:
    thread t1;

    void worker() {
        for (int i = 0; i < 10000000; i++) {
            printf("%d", i);
        }
    }

   public:
    Example() {
        t1 = std::thread(worker);
    }
};
```

編譯之後悲劇：
```
In file included from C:/msys64/ucrt64/include/c++/12.2.0/thread:43,
                 from C:\Users\...\test.cpp:2:
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h: In instantiation of 'std::thread::thread(_Callable&&, _Args&& ...) [with _Callable = void (Example::*)(); _Args = {}; <template-parameter-1-3> = void]':
C:\Users\...\test.cpp:17:32:   required from here
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h:129:72: error: static assertion failed: std::thread arguments must be invocable after conversion to rvalues
  129 |                                       typename decay<_Args>::type...>::value,
      |                                                                        ^~~~~
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h:129:72: note: 'std::integral_constant<bool, false>::value' evaluates to false
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h: In instantiation of 'struct std::thread::_Invoker<std::tuple<void (Example::*)()> >':
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h:202:13:   required from 'struct std::thread::_State_impl<std::thread::_Invoker<std::tuple<void (Example::*)()> > >'
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h:142:29:   required from 'std::thread::thread(_Callable&&, _Args&& ...) [with _Callable = void (Example::*)(); _Args = {}; <template-parameter-1-3> = void]'
C:\Users\...\test.cpp:17:32:   required from here
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h:251:11: error: no type named 'type' in 'struct std::thread::_Invoker<std::tuple<void (Example::*)()> >::__result<std::tuple<void (Example::*)()> >'
  251 |           _M_invoke(_Index_tuple<_Ind...>)
      |           ^~~~~~~~~
C:/msys64/ucrt64/include/c++/12.2.0/bits/std_thread.h:255:9: error: no type named 'type' in 'struct std::thread::_Invoker<std::tuple<void (Example::*)()> >::__result<std::tuple<void (Example::*)()> >'
  255 |         operator()()
      |         ^~~~~~~~
```

std系列還真是讓人難以捉摸，把比較像錯誤的訊息找找看：
```
error: static assertion failed: std::thread arguments must be invocable after conversion to rvalues
```

結果都跟我說是參數傳遞問題...  
可是我沒有傳遞參數？
```cpp
void worker();
t1 = std::thread(worker);
```

連回傳值都是void，這該怎麼辦？  
想到它是在Class裡發生的，改變一下關鍵字

解答：[Start thread with member function](https://stackoverflow.com/questions/10673585/start-thread-with-member-function)

這樣就可以了
```cpp
t1 = std::thread(&Example::worker, this);
```

繼續Coding~
