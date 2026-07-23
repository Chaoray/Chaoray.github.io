---
title: O(n)預處理組合數
date: 2026-07-23
tags:
  - 競程
  - 筆記
---
由於 $C^n_r$ 是階乘，直接硬算會算很久，因此預先處理來快速算出組合數尤為重要。
想法是利用模反元素，將除以 $k!$ 改成乘以 $k!$ 的模反元素。這個方法預處理的時間複雜度為 $O(N)$，之後就能用 $O(1)$ 查詢。
步驟：
1. 先開一個陣列紀錄 $0! \sim n! \pmod M$ 的值
2. 計算 $n! \pmod M$ 的模逆元，再開一個陣列紀錄 $k! \sim 0!$ 的模逆元。
   只要先求出 $(k!)^{-1}$ ，就可以利用 $(k!)^{-1} = (k + 1)!^{-1} \times (k + 1) \pmod M$ 來由大到小得出所有階乘的模逆元。
3. 查詢時，只要利用 $C^n_k = n! \times (k!)^{-1} \times ((n - k)!)^{-1} \pmod M$ 在 $O(1)$ 得出。

```cpp
#define MOD 1000000007LL
#define MAXN 200005
#define ll long long

using namespace std;

ll qpow(ll a, ll b) {
    ll res = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) {
            res = res * a % MOD;
        }
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

ll inverse_mod(int a) {
    return qpow(a, MOD - 2);
}

ll fact[MAXN], inv_fact[MAXN];

void precompute_combination() {
    fact[0] = 1;
    inv_fact[0] = 1;

    for (int i = 1; i < MAXN; i++) {
        fact[i] = fact[i - 1] * i % MOD;
    }

    inv_fact[MAXN - 1] = inverse_mod(fact[MAXN - 1]);
    for (int i = MAXN - 2; i >= 1; i--) {
        inv_fact[i] = inv_fact[i + 1] * (i + 1) % MOD;
    }
}

ll nCr(int n, int r) {
    if (r < 0 || r > n) return 0;
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD;
}
```
