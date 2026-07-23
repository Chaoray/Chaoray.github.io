---
title: Suffix Array
date: 2026-07-23
tags:
  - 競程
  - 筆記
---
## 後綴是甚麼？
比方說字串 `S = banana`，S的所有後綴就是：
```
banana
anana
nana
ana
na
a
```

將這些後綴排序後：
```
a
ana
anana
banana
na
nana
```

Suffix Array就是將字串的每個後綴進行排序後，紀錄該後綴開頭index的陣列：

```cpp
int SA[N];
SA[i]; // 表示順序第i個後綴的開頭index
```

如果 `SA[3] = 0` ，表示字典序第 4 小的後綴是從 `S[0]` 開頭的，也就是 `banana`。

例題：算出 `s = "aba"` 的 SA 陣列

> [!SPOILER] ans
> ```cpp
> SA[3] = {2, 0, 1};
> ```

## 怎麼找出 Suffix Array ？

暴力法就是把所有後綴抓出來，然後進行排序。顯然這個方法的時間複雜度是 $O(N^2\log N)$ (別忘了比較兩個字串要 $O(N)$)。

所以我們要使用倍增法。倍增法的核心是，如果問題可以被拆解成 1/2 規模的子問題，則先計算該規模的子問題，然後再求出原本的問題。也就是說，可以先解決 `n=1` 時的問題，接著解決 `n=2`、解決 `n=4`、解決 `n=8`...，最後求出原本的問題。

我們不一次比對整個字串，而是長度翻倍地比（1 $\rightarrow$ 2 $\rightarrow$ 4 $\rightarrow$ 8 ...）。

假設我們想比較長度為 2 的子字串：
- 我們不用逐字元比較，而是把長度 2 拆成 「前 1 個字元」 與 「後 1 個字元」。
- 因為前 1 個字元的排名我們上一輪已經算過了，所以只需拿兩個數字（雙元組 `(第一部分排名, 第二部分排名)`）出來比大小即可

我們以 `S = aba` 為例，以下是 S 的所有後綴：

```
aba
ba
a
```

首先看長度為 1 的字串，並排序他們並表示成一個 Rank 陣列(`Rank[i]` 表示以 `S[i]` 開頭的後綴的排名)：

| 索引 | 長度 1 的字串 | 排名(Rank陣列) |
| -------- | -------- | -------- |
| 0     | 'a'     | 0     |
| 1     | 'b'     | 1     |
| 2     | 'a'     | 0     |

我們接著看長度為 2 的字串：

```
ab
ba
a_
```

由於第三個字串長度不足二，以_表示空位。觀察一下，要比較 `aba` 這個字串前兩個字 `ab` 時，會發現 `ba` 是 `aba` 的後綴，那麼是不是可以利用我們先前處理過 `ba` 中第一個字 `b` 的排名，來求出 `aba` 前兩個字 `ab` 的排名？

所以可以這樣想：把 `ab` 拆成 `a` 和 `b`，然後分別比較 `a` 和 `b` 與其他字串的排名，來求出整體 `ab` 的排名，也就是前面提到的 pair。

那要怎麼快速建立這個 pair？可以利用前半段的 `Rank[當前位置]` 和後半段的 `Rank[當前位置 + w]` 組成（如果超出字串範圍，排名算 -1），`w` 表示我們要比的字串長度的一半。

以下是這些長度為 2 的字串的 pair：
```
ab -> (0, 1)
ba -> (1, 0)
a_ -> (0, -1)
```

如果使用 `std::sort` 對這些 pair 進行排序，需要花費 $O(N \log^2 N)$。但是可以發現，我們在排序的東西(排名)範圍都落在 `-1~N` 之間，所以理想上，可以使用 Counting Sort 來實現 $O(N)$ 排序，所以時間複雜度變成 $O(N \log N)$。
## Sample Code
$O(N \log^2 N)$ 版本：
```cpp
vector<int> build_sa(const string& s) {
    int n = s.length();
    vector<int> sa(n), rk(n), next_rk(n);

    // 1. 初始化：長度為 1 的排名 (直接用 ASCII 碼)
    for (int i = 0; i < n; i++) {
        sa[i] = i;
        rk[i] = s[i];
    }

    // 2. 倍增迭代：w 為半長度 (1 -> 2 -> 4 -> 8...)
    for (int w = 1; w < n; w <<= 1) {
        // 自訂比較函式：比對雙元組 (rk[i], rk[i + w])
        auto cmp = [&](int i, int j) {
            if (rk[i] != rk[j]) return rk[i] < rk[j];
            int ri = (i + w < n) ? rk[i + w] : -1;
            int rj = (j + w < n) ? rk[j + w] : -1;
            return ri < rj;
        };

        // 直接用std::sort進行排序
        sort(sa.begin(), sa.end(), cmp);

        // 3. 根據排序結果更新下一輪的排名
        next_rk[sa[0]] = 0;
        for (int i = 1; i < n; i++) {
            next_rk[sa[i]] = next_rk[sa[i - 1]] + (cmp(sa[i - 1], sa[i]) ? 1 : 0);
            // 如果排名還是一樣，則不改變，否則將排名往後挪
        }
        rk = next_rk;

        // 若排名均不相同，代表排序已完全確定，可提早結束
        if (rk[sa[n - 1]] == n - 1) break;
    }
    return sa;
}
```

$O(N \log N)$ 版本：
```cpp
vector<int> build_sa(const string& s) {
    int n = s.length();
    int m = 128; // 字元集大小 (ASCII 碼最大值)
    vector<int> sa(n), rk(n), tp(n), cnt(max(n, m), 0);

    // 1. 初始：對長度為 1 的字元做計數排序 (O(N))
    for (int i = 0; i < n; i++) cnt[rk[i] = s[i]]++;
    for (int i = 1; i < m; i++) cnt[i] += cnt[i - 1];
    for (int i = n - 1; i >= 0; i--) sa[--cnt[rk[i]]] = i;

    // 2. 倍增迭代：w 為 1 -> 2 -> 4 -> 8...
    for (int w = 1, p = 0; p < n; w <<= 1, m = p) {
        
        // --- 第一步：直接利用上一輪 SA 整理第二關鍵字 (O(N)) ---
        p = 0;
        // 超出範圍的位置 (第二關鍵字為 -1) 最優先
        for (int i = n - w; i < n; i++) tp[p++] = i;
        // 依照上一輪 SA 順序，放入其餘第二關鍵字
        for (int i = 0; i < n; i++) {
            if (sa[i] >= w) tp[p++] = sa[i] - w;
        }

        // --- 第二步：對第一關鍵字做計數排序 (O(N)) ---
        fill(cnt.begin(), cnt.begin() + m, 0);
        for (int i = 0; i < n; i++) cnt[rk[tp[i]]]++;
        for (int i = 1; i < m; i++) cnt[i] += cnt[i - 1];
        for (int i = n - 1; i >= 0; i--) sa[--cnt[rk[tp[i]]]] = tp[i];

        // --- 第三步：重新更新 Rank 陣列 (O(N)) ---
        swap(rk, tp);
        rk[sa[0]] = 0;
        p = 1; // p 記錄當前有多少種不同的排名
        for (int i = 1; i < n; i++) {
            // 比較 sa[i] 和 sa[i-1] 的第一與第二關鍵字是否完全一樣
            bool is_same = (tp[sa[i]] == tp[sa[i - 1]]) &&
                           ((sa[i] + w < n ? tp[sa[i] + w] : -1) == (sa[i - 1] + w < n ? tp[sa[i - 1] + w] : -1));
            rk[sa[i]] = is_same ? p - 1 : p++;
        }
    }
    return sa;
}
```