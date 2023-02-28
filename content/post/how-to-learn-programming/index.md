---
title: "怎麼樣學程式"
description: ""
date: 2023-02-28T22:23:08+08:00
tags: []
categories: ["casual"]
image: title.png
---

## 怎麼開始？

不管甚麼原因致使你踏入這個領域，如果你不是非自願、沒有熱誠，我肯定你沒辦法在這條路上走下去  
**只要你有一台能跑的電腦、能正常運作的編輯器**，那很好，你已經開始一半了  

是甚麼念頭讓你對程式感興趣呢，就朝那個方向邁進吧

### 善用網路

應該都聽過一句話：**「You know google? You can google.」**  
對，遇到不懂的，不管三七二十一直接丟上google就對了

不懂的英文？可以翻譯  
在你未來繼續走下去的路上，**網路絕對是你最好的夥伴**

假如我在一篇文章裡看到：「Currying」  
我唯一確定的是他跟程式有關  
丟上Google一查  
「Currying 程式」  
原來是柯里化||還想說是咖哩或是某個知名球星||  

然後，順著Currying這個名詞，我又額外查了很多名詞、找了很多資料，了解柯里化到底是甚麼  
這樣又學到了很多東西

### 學甚麼語言？

一個語言，在你對程式有點小懂開始，其實就會發現，等同於工具  
需要，用的到，所以學，所以寫  

對初學者來說，從簡單的語言開始絕對是康莊大道  
常見的有：`Python`、`Java`、`JavaScript`、`HTML/CSS`

P.S.：如果不知道這是甚麼，請右轉Google  

如果你想問的是：這麼多選擇中，我該學哪一種會比較有幫助、比較好找工作？  
**你看哪個順眼就學吧**，不然靠抽籤也是可以的  

程式語言就像是方言，雖然聽起來很不一樣，但是同樣的概念會一再重複  
只要你能使用一個程式語言，那其他的對你來講只是轉個彎而已  

不過還是有特例啦，像`COBOL`、`ASM` ||上古時期的東西||

如果你的學校還在教`C`、`Scratch`，我建議你直接自學

## 好的習慣

很多習慣會影響你後來寫程式的好壞，只要習慣了，絕對不一樣

### 好的命名

有天小明他爸透過聊天軟體問小明要吃甚麼，小明敲不定主意  
回了句：「IDK」  
小明他爸直接恍然大悟  

IDK是甚麼？是某種食物嗎？還是哪家店？還是罵人的話？||~~怎麼辦我是不是被他討厭了~~||  
於是接下來的時間小明爸沒再跟小明講過話 (x

所以說，縮寫很容易造成誤會  
請參考以下事項：  
Reminds me of a post I read on either reddit or quora about a guy who read some old code of his and noticed there was a variable oddly named "feet", then decided to investigate why this was and found out that, due to abbreviation, the original name "legacyHandles" came to be "legHands" which then ended up as "feet".

簡單翻譯一下，就是有人把一個原本跟"腳"搭不上邊的變數名稱，硬生生地變成了"腿的手"，也就是"腳"  
**縮寫就是斷章取義，就算只有一點縮寫也可能會讓後來看你的程式碼的人誤解**  

但其實有些縮寫可以，就是約定俗成，而且實在是太常用了
```
string -> str
object -> obj
array -> arr
error -> err
length -> len
message -> msg
number -> num
position -> pos
address -> addr
temporary -> tmp
argument -> arg
```
可以去看看別人整理的：[编程常用缩写 by bill_20106029](https://blog.csdn.net/elegant__/article/details/9748835)

通常來說，主流有兩種變數名稱寫法：
1. [**駝峰命名法(Camel Case)**](https://zh.wikipedia.org/zh-tw/%E9%A7%9D%E5%B3%B0%E5%BC%8F%E5%A4%A7%E5%B0%8F%E5%AF%AB)：將每個單詞的開頭大寫
2. [**蛇形命名法(Snake Case)**](https://zh.wikipedia.org/zh-tw/%E8%9B%87%E5%BD%A2%E5%91%BD%E5%90%8D%E6%B3%95)：將每個單詞小寫後以底線分開

```cpp
// 駝峰
camelCase
CamelCase

// 蛇形
snake_case
```

比較古早味的Code或工程師，很常會看到[匈牙利命名法](https://zh.wikipedia.org/zh-tw/%E5%8C%88%E7%89%99%E5%88%A9%E5%91%BD%E5%90%8D%E6%B3%95)
```cpp
float fPrice = 10.0f;
int iCount = 10;
bool bBusy = false;
float* fpPrice = &fPrice;  // float point
```
也就是將變數型別納入變數名稱中，不過現在IDE很強大，根本不需要你做這種事

一些我常用的命名規則：  
```cpp
// 布林值：用Yes/No問句命名
bool isBusy, canBeDestroyed;
// 或者有些語言支援問號在變數裡
bool isOverlapped?, isArrayEmpty?;

// 常數：全大寫
int WINDOW_HEIGHT = 100;

// 函數：以動詞開頭
long createTimestamp();
bool checkIsClientReady();

// 類別：開頭全大寫
class FireMagician;
class JavascriptLanguageCompiler;
```

選擇自己看起來舒服就好，記住，**不要縮寫!!!**，就算變數名稱再長，寫就對了!
```cpp
int i_have_no_idea_what_this_variable_should_be_called_but_anyway_i_named_it;
```

### 限制參數傳入量

今天有個這樣的函式：
```js
function createUserAccountInfo(name, address, birthday, age, email, phoneNumber, fbName, igId)
```

你在用的時候
```js
createUserAccountInfo("John", "my-email@mail.com", );
```
阿，好像信箱地址不是擺這的，回去看看......原來前面要先填地址
```js
createUserAccountInfo("John", "ThisCity-ThatTown-ThatRoad", "my-email@mail.com", "0912345678");
```
奇怪，IDE跳錯誤，怎麼要填整數，回去看看......是要填年齡阿
```js
createUserAccountInfo("John", "ThisCity-ThatTown-ThatRoad", "my-email@mail.com", 23, "0912345678", "2000-1-1", "i_am_john", "john987123");
```
當你以為一切安好，跑跑看的時候...  
整個就是大災難

原本該填生日的地方變成了信箱  
該填電話號碼的地方變成了生日

肯定當場氣到哭

通常，如果超過三個變數，就建議拆成兩個以上函式  
以剛剛的`createUserAccountInfo`舉例：
```js
function createUserAccountInfo(birthInfo, contactInfo, socialMediaInfo)

function createAccountBirthInfo(birthday, age)
function createAccountContactInfo(address, email, phoneNumber)
function createAccountSocialMediaInfo(fbName, igId)
```
清爽多了，而且哪個函式有問題基本上都可以直接抓出來修  
如果你真的要用到更多的變數，那請考慮將它們包成一個物件：
```js
let AccountInfo = {
    name: "",
    address: "",
    birthday: "",
    age: 0,
    email: "",
    phoneNumber: "",
    fbName: "",
    igId: ""
};
```

### 一個函式，做一件事

又叫單一職責原則，簡單來說就是，**做函式名稱做的事，但只有一件事**

考慮以下函式：
```js
function createUserAccountInfo(accountInfo) {
    let info = new UserAccountInfo(accountInfo);
    sendInfo(info);
    info.balance = 0;
    return info;
}
```
怎麼突然就跑去寄資料了？為甚麼又設定餘額為0？  
然後過沒幾天你就會在後台發現不知為何多了很多筆使用者資料...  

那麼要如實寫出函式做了甚麼：
```js
function createUserAccountInfoAndSendInfoAndSetBalanceTo0(accountInfo) {
    let info = new UserAccountInfo(accountInfo);
    sendInfo(info);
    info.balance = 0;
    return info;
}
```
很肯定的，沒有人知道我到底在寫甚麼，我也不知道  
就算如實寫出來，那也違反了**只做一件事**

所以可以拆成
```js
function registerUserAccount(infoObj) {
    let info = createUserAccountInfo(infoObj);
    info = initUserAccountInfo(info);

    if (sendUserAccountInfo(info)) {
        return info;
    } else {
        throw new Error("Could not send user account");
    }
}

function createUserAccountInfo(accountInfo) {
    let info = new UserAccountInfo(accountInfo);
    return info;
}

function sendUserAccountInfo(accountInfo) {
    let res = sendInfo(accountInfo);
    return res.success;
}

function initUserAccountInfo(accountInfo) {
    accountInfo.balance = 0;
    return accountInfo;
}
```

## 關於程式實力

我覺得程式的實力可以大致分成兩個部分  
1. 內功：你的思考方式
2. 外功：你的知識

內功好的人不代表外功好，像是你問一個寫程式競賽很厲害的人，甚麼是"OOP"，可能一問三不知 

也有可能你問一個看起來很博學多聞的人，甚麼是"氣泡排序"，他完全不知道怎麼解釋，只說得出來他是拿來排序的

所以只有內外兼修，相輔相成，才能提升你的程式實力  
but  
上職場後，看重的又不全是你的程式實力了

對於一個好的軟體工程師而言：  
`實力 = 內功15% + 外功25% + 溝通能力25% + 規劃能力35%`
