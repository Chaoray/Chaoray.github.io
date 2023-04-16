---
title: "JS用物件當鍵值"
description: "前些日子寫出的bug，直接把我搞到瘋掉"
date: 2023-04-16T18:04:10+08:00
tags: ['js', 'object']
categories: ['tutorial']
---

## 問題

事情是怎麼發生的呢? 且聽我娓娓道來......  

當時我就想，為了確保每個屬性的獨特性，我做了這件事  

```js
let fruit = {
    'Apple': Symbol('Apple'),
    'Grape': Symbol('Grape'),
};

let products = {
    [fruit.Apple]: ['Apple Juice', 'Apple Pie'],
    [fruit.Grape]: ['Grape Juice', 'Grape Jam'],
};
```

目前為止都很正常，直到...  

直到我想在每個水果中加個Color屬性...

```js
let fruit = {
    'Apple': {
        symbol: Symbol('Apple'),
        color: 'Red',
    },
    'Grape': {
        symbol: Symbol('Grape'),
        color: 'Green',
    },
};
```

然後products、products他！  

他就、就只剩下一個屬性了！？  

## 解析

為了解釋發生了甚麼，來做幾個測試：

1. Key的類型
2. 何種類型會造成這種結果

```js
console.log(typeof Object.keys(products)[0]);

let keyObj1 = { a: 1 };
let keyObj2 = { a: 1 };
let keyArr1 = [1];
let keyArr2 = [1];

let obj = {
    [keyObj1]: 1,
    [keyArr1]: 2,
    [keyObj2]: 3,
    [keyArr2]: 4,
};

console.log(obj);
```

結果：
```
string
{ '1': 4, '[object Object]': 3 }
```

原來，js在創建物件時，**會把輸入值轉成字串**  
然而Symbol是個例外，也就是說，**js物件的鍵值可以是Symbol/String**

所以才有剛剛那種~~慘案~~發生  

## 解方
### Map

Map應該會是最佳選擇，Map的Key可以是任何類型  
還有Map比起Object，Map中的Key-Value Pair是有順序的，不像Object是無序  

```js
let map = new Map();
map.set(keyObj1, 1);
map.set(keyArr1, 2);
map.set(keyObj2, 3);
map.set(keyArr2, 4);

for (let item of map) {
    console.log(item);
}
```
```
[ { a: 1 }, 1 ]
[ [ 1 ], 2 ]
[ { a: 1 }, 3 ]
[ [ 1 ], 4 ]
```

### WeakMap

WeakMap就比較玄了  
**他的Key只能是Object**，當然null不行  
再來他是弱引用，甚麼意思呢?

```js
let obj1 = {
    a: {
        a1: 1,
    }
};

let weakmap = new WeakMap();

weakmap.set('123', '123');  // TypeError: Invalid value used as weak map key
weakmap.set(obj1.a, 'obj1.a');

console.log(weakmap.has(obj1.a));
console.log(weakmap.get(obj1.a));

delete obj1.a;

console.log(weakmap.has(obj1.a));
console.log(weakmap.get(obj1.a));
```
```
true
obj1.a
false
undefined
```

就是當一個Key被刪除或是被回收時，**WeakMap中的Key-Value Pair也會同時消失**  
可以防止內存洩漏的問題  
還有，WeakMap是看不到Key List的，所以他的Key List會取決於Key存不存在  
所以當Key被Garbage Collection回收時，對應的Value會消失

比較多會用在DOM的處理，DOM元素消失後，Value也消失了||拉人下水||  

題外話：  
我個人覺得應該叫強引用而不是弱  
因為WeakMap實際上加強了對Key的連結  
叫弱引用...想不太通
