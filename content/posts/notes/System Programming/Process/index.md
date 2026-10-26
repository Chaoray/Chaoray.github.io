---
title: SPFall2026 - Process
description: ""
summary: ""
date: 2026-10-16
isCJKLanguage: true
categories: []
tags:
  - 筆記
draft: false
---
## What is Process?

Process 進程，是作業系統中用來管理工作的單位之一，可以把他想成一個國家中的個人，而 Kernel 就是國家的管理機構，實際上 Kernel 也是進程。與 Process 相比，Program 則是指存在硬碟上的執行檔，把 Program 載入記憶體並執行機器碼就叫 Process，所以 Process 是 Program 的實例（instance）。

系統為了管理 Process ，會給每個 Process 指派一個唯一的 ID（簡稱 PID），除此之外 Process 還會有自己的 Program Counter、State、Memory Layout、File Descriptor Table 等等，這些都存在一個叫做 Process Control Block （簡稱 PCB）的結構之中。 Linux 中定義的 PCB 叫做 `task_struct` ，細節可以到 [/include/linux/sched.h](https://github.com/torvalds/linux/blob/master/include/linux/sched.h#L835) 看，是一個長達數百行的結構。

```c
struct task_struct {
    ...
    pid_t                 pid;           /* Task ID (Kernel 內部的任務標識符) */
    pid_t                 tgid;          /* Thread Group ID (User Space 看到的 POSIX PID) */
    struct task_struct __rcu *real_parent;/* 建立此進程的原始父進程 */
    struct task_struct __rcu *parent;     /* 目前接收終止狀態與訊號的父進程 (Orphan 時指向 PID 1) */
    struct list_head      children;      /* 子進程鏈表頭 (指向自己創立的所有子進程) */
    struct list_head      sibling;       /* 兄弟節點 (將自己掛載於父進程的 children 鏈表中) */

    unsigned int          __state;       /* 進程狀態 (TASK_RUNNING, TASK_INTERRUPTIBLE, EXIT_ZOMBIE 等) */
    int                   prio;          /* 動態優先權 (排程器計算 CPU 資源分配與 Context Switch 的依據) */
    int                   static_prio;   /* 靜態優先權 (基於 nice 值計算) */
    unsigned int          policy;        /* 排程策略 (如 SCHED_NORMAL, SCHED_FIFO, SCHED_RR) */

    struct mm_struct     *mm;            /* 虛擬記憶體描述符 (包含 text, data, heap, stack 與 page table) */
    struct mm_struct     *active_mm;     /* 實際使用的虛擬記憶體空間 (Kernel Thread 借用其他進程的 mm) */

    struct files_struct  *files;         /* 檔案描述符表 (File Descriptor Table，包含 stdin/stdout/stderr 陣列) */
    struct fs_struct     *fs;            /* 檔案系統環境 (包含當前工作目錄 pwd 與根目錄 root) */

    const struct cred __rcu *cred;       /* 安全憑證 (包含 Real/Effective/Saved UID 及 GID) */

    struct signal_struct *signal;        /* 共享信號描述符 (同一個進程內所有 thread 共享) */
    sigset_t              blocked;       /* 被遮罩/阻塞的信號集合 (Signal Mask) */
    sigset_t              pending;       /* 已發送但尚未處理的懸掛信號集合 */
    ...
};
```

Unix 提供了 `getpid` 來獲得當前 PID、`getppid` 來獲得父進程的 PID：
```c
#include <unistd.h>
// Return: process ID of calling process
pid_t getpid(void);
// Return: the parent process ID of calling process
pid_t getppid(void);
```
## Process Lifecycle

前面提到 Process 會有執行狀態，分別是 New、Ready、Running、Waiting、Terminated：
- New：The process is being created
- Running：The program is executed on a CPU
- Waiting：The process is waiting for some events to occur
- Ready：The process is waiting to be assigned to a CPU
- Terminated：The process has finished execution

從 Running -> Ready 或 Ready -> Running，在 CPU 上執行、等待發配給 CPU 的過程就叫做 Context Switching。舉例來說， Process A 執行一段時間後， Kernel 會把他的狀態存到 Process 1 的 PCB，接著從 Process B 的 PCB 中取出 Process B 的狀態，接著執行一段時間後再換人。

![](context-switching.png)
來源：SP2026Fall sp07-proc-control.pdf
### `exec` & `fork`

假設我們正在撰寫一個 C 程式，希望它能夠執行 Linux 中的 `ls` 命令，列出目前目錄的檔案。最直覺的想法，可能是直接在程式中像在 shell 中呼叫 `ls` 一樣。事實上，Linux 確實提供了這樣的機制，也就是 `exec` 函式家族：

```c
#include <unistd.h>
// All return -1 on error; no return on success
int execl(const char *pathname, const char *arg0, … /* (char *)0 */ );
int execv(const char *pathname, char *const argv[]);
int execle(const char *pathname, const char *arg0, … /* (char *)0, char *const envp[] */ );
int execve(const char *pathname, char *const argv[], char *const envp[]);
int execlp(const char *filename, const char *arg0, … /* (char *)0 */ );
int execvp(const char *filename, char *const argv[]);
```

`exec` 函式家族的功能是以指定的 Program 取代目前進程，然後分配新的記憶體、暫存器等，但是進程本身的 PID 與父進程不會變，就像是把進程的外包裝留著，換掉內部的東西。
這些函式的功能大同小異，差別主要在於參數的傳遞方式，以及如何指定環境變數與搜尋執行檔。可以透過函式名稱中的字母來記憶：
- `l`：個別傳入參數
- `v`：以陣列傳入參數，注意最後一個參數後必須加上 `NULL`
- `p`：支援透過 PATH 搜尋執行檔（不用指定 `/bin/ls` 這類完整路徑）
- `e`：可以指定新程式的環境變數
比較常用的有 `execve` 與 `execvp`。

環境變數只是一堆字串，如 `{"A=1", "B=2", ...}` ，使用者需要自行解析並找出變數帶有的值。

舉例來說，讓程式執行 `ls`：
```c
int main() {
    printf("Before execvp\n");
    char *args[] = {"ls", "-l", NULL};
    execvp("ls", args);
    printf("After execvp\n");
    return 1;
}
```
輸出：
```
$ gcc myls.c && ./a.out
Before execvp
total 20
-rwxrwxr-x 1 admin admin 16048 Oct 24 22:27 a.out
-rw-rw-r-- 1 admin admin   154 Oct 24 22:27 myls.c
```

因為`execvp()` 成功時，會以新的 Program 取代目前進程，所以 `After execvp` 並不會被輸出。雖然說原進程大部分的屬性都會消失，但是有些屬性，如未設定 `FD_CLOEXEC` 標籤的 FD 還會繼續保留。如果沒使用帶有 `e` 的 `exec` ，那麼環境變數也會保留。注意如果執行的是帶有 `setuid/gid` 的 Program，那麼進程的 Effective UID/GID 也會改變。
此外，由 `fcntl` 設定的鎖也會保留，一個簡單判斷鎖會不會保留的方法就是看 PID 有沒有變。

`exec` 詳細的用法，以下程式都執行 `ls -l`：
```c
char *argv[] = {"ls", "-l", NULL};
char *envp[] = {"YEAR=2026", "COURSE=SystemProgramming", "SEMESTER=Fall", NULL};

execl("/bin/ls", "ls", "-l", NULL);
execlp("ls", "ls", "-l", NULL);
execl("/bin/ls", "ls", "-l", NULL, envp);
execv("/bin/ls", argv);
execvp("ls", argv);
execve("/bin/ls", argv, envp);
```

---

用 `exec` 並不能真的創造一個新進程，所以 `fork` 就來了，非遲但到。
當一個行程呼叫 `fork()` 時，系統會建立一個新的進程，稱為子進程（child process）；呼叫 `fork()` 的原始進程則稱為父進程（parent process）。在一般情況下，父進程與子進程會從 `fork()` 呼叫之後繼續執行。

```c
#include <unistd.h>  
// returns: 0 if in the child, process ID of child if in the parent, -1 on error 
pid_t fork(void);
```
呼叫 `fork` 後，系統會把父進程的狀態複製給子進程（乾一直打成紫禁城）。此時需要透過 `fork` 的回傳值分辨目前執行的身份是 parent 還是 child。如果 `fork` 回傳大於 0 的值表示在 parent，回傳 0 表示在 child。
`fork` 會失敗的原因通常是目前進程數量達到 Kernel 上限（4194304個），或每個使用者能擁有的進程數量達到上限（47812個）。

舉例來說：
```c
int main() {
    if (fork() == 0) { // fork 後 child 會從判斷回傳值開始
        printf("Hello from child\n");
    } else {
        printf("Hello from parent\n");
    }
    return 0;
}
```
輸出：
```
$ gcc fork.c && ./a.out
Hello from parent
Hello from child
```

子進程與父進程的不同之處在於， `fork` 後的那一刻他們都有相同的 Memory Layout、Program Counter、Call Stack、File Descriptor Table、Environment Variables、Effective UID/GID 等等，這種情況叫做子進程「繼承」父進程的狀態（Inheritance）。

當然還是有些東西不會繼承，如：Memory locks、POSIX Timers、Threads、POSIX File Locks（用 `fcntl` 設定的鎖）、Nonblocking IO Tasks 等。

除此之外，他們也不會共用記憶體空間，舉例來說：
```c
int main() {
    int x = 114514;
    if (fork() == 0) {
        x = 1919810;
        printf("child: x = %d\n", x);
    } else {
        printf("parent: x = %d\n", x);
    }
    return 0;
}
```
輸出：
```c
parent: x = 114514
child: x = 1919810
```

不論 child 如何更改 `x`， parent 所讀到的還會是原本的值。 Linux 為了節省系統開銷，採用了 Copy-On-Write 機制，只有當資料真的需要被修改時，才建立一份獨立的副本，它讓作業系統不必在建立 child process 時，立刻複製 parent process 的所有記憶體內容。

在 `fork` 完成後，此時 parent 和 child 的虛擬記憶體會對應到同一個記憶體分頁，此時這個分頁會被設為唯讀，讓兩者暫時無法直接修改這個共用頁面。假設 child 要寫入時，就會觸發頁面錯誤（Page Fault），說明分頁映射出了問題。
在系統確認完這次是一個合法的寫入後，就會配置一個新的實體記憶體頁面，並將 child 的虛擬記憶體映射改成指向新頁面，然後將兩邊的頁面都設為可寫入。

`fork` 的常用場景：
- 父進程與子進程同時執行不同部份的程式，常用在 server
- 程式想要執行其他 Program 時，搭配與 `exec` 使用，如 shell

因為 CPU 會作排程，所以無法確定 parent 或 child 哪個先執行，所以最好的辦法，就是在父子進程間實作同步機制，給你做一個 Sleep 或 Pipe…。

---
### `exit`

```c
#include <stdlib.h> (specified in ISO C)
void exit(int status);
void _Exit(int status);
#include <unistd.h> (specified in POSIX.1)
void _exit(int status);
```
*正常*結束進程，也就是說會釋放資源。`status` 是結束狀態，常看到的 `return 0` 就是結束狀態 `0`，非零值代表不正常結束（執行錯誤等等），需要使用者自行解讀回傳值。

| 行為                  | `exit()` | `_Exit()`    | `_exit()`    |
| ------------------- | -------- | ------------ | ------------ |
| 定義標準                | ISO C    | ISO C（C99 起） | POSIX        |
| 執行 `atexit()` 註冊的函式 | 是        | 否            | 否            |
| 刷新 `stdio` 緩衝區      | 是        | 否            | 否            |
| 關閉 `stdio` streams  | 是        | 不執行標準 I/O 清理 | 不執行標準 I/O 清理 |
| 關閉進程的檔案描述符          | 是，經由終止程序 | 是，經由終止程序     | 是            |
| 終止進程                | 是        | 是            | 是            |
![](exit-detail.png)
來源：SP2026Fall sp08-proc-control.pdf

```c
#include <stdlib.h>
// Returns 0 if OK, nonzero on error
int atexit(void (*func)(void));
```
註冊一個函式 `func`，然後該函式會在 `exit()` 執行時執行。父進程註冊的 `atexit` 函式 `fork` 後會被繼承。

舉例：
```c
static void exit_handler(void) {
    printf("All tasks done... Leaving...\n");
}
int main(void) {
	atexit(exit_handler);
	printf("Doing some tasks here...\n");
	return 0;
}
```
輸出：
```
$ gcc exit.c && ./a.out
Doing some tasks here...
All tasks done... Leaving...
```

---
### `wait`

```c
#include <sys/wait.h>
// Both return: process ID if OK, 0, or -1 on error
pid_t wait(int *statloc);
pid_t waitpid(int pid, int *statloc, int options);
```

### Zombie Process & Orphan Process

## Inter-Process Communication

### Pipe

### FIFO

