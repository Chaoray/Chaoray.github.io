#### File

| Flag         | Meaning                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `O_CREAT`    | Create if nonexistent                                                                                                                |
| `O_EXCL`     | With `O_CREAT`, fail if already exists                                                                                               |
| `O_TRUNC`    | Truncate existing regular file, need `O_WRONLY`                                                                                      |
| `O_APPEND`   | Each write is performed at the then-current EOF, with offset adjustment and writing atomic with respect to other file modifications. |
| `O_CLOEXEC`  | Set close-on-exec (only `F_SETFD`)                                                                                                   |
| `O_NOFOLLOW` | Don't follow final symbolic link                                                                                                     |

| 操作方式                                                | 描述符表 (FD Table) | 系統開啟檔案表 (Open File Table) | V-node / I-node 表 | 檔案偏移量 (Offset) 是否共享         | File Status Flags 是否共享 | FD Flags (`FD_CLOEXEC`) 是否共享          |
| --------------------------------------------------- | --------------- | ------------------------- | ----------------- | --------------------------- | ---------------------- | ------------------------------------- |
| **兩程序獨立呼叫** **open()** **同一檔案**                     | 兩程序各自建立 entry   | **各自建立獨立 entry**          | **共享同一 entry**    | **獨立（不共享）**                 | 獨立                     | 獨立                                    |
| **fork()** **建立子程序**                                | 子程序複製父程序表格      | **共享相同 entry** (引用計數 +1)  | **共享同一 entry**    | **共享（一端讀寫，另一端 Offset 一起變）** | 共享                     | **複製狀態，但列為獨立 bit**                    |
| **dup()** **/** **dup2()** **/** **fcntl(F_DUPFD)** | 當前程序新增 entry    | **共享相同 entry** (引用計數 +1)  | **共享同一 entry**    | **共享（操作新舊 fd 皆改同一 Offset）** | 共享                     | **新 fd 之** **FD_CLOEXEC** **被清空 (0)** |

| Event     | Meaning                |
| --------- | ---------------------- |
| `POLLIN`  | Data available to read |
| `POLLOUT` | Writing is possible    |
| `POLLHUP` | Other end has closed   |
| `POLLERR` | Error condition        |

| Timestamp | Meaning                                     |
| --------- | ------------------------------------------- |
| `atime`   | Last access data                            |
| `mtime`   | Last content modification                   |
| `ctime`   | Last inode/status change; not creation time |

| Operation                  | atime          | mtime          | ctime          |
| -------------------------- | -------------- | -------------- | -------------- |
| Read file                  | Yes*           | No             | No             |
| Write to file              | No             | Yes            | Yes            |
| `chmod`                    | No             | No             | Yes            |
| `chown`                    | No             | No             | Yes            |
| Create file                | Yes (new file) | Yes (new file) | Yes (new file) |
| Read directory             | Yes*           | No             | No             |
| Add/remove directory entry | No             | Yes            | Yes            |

File Lock:
Close any FD referring to that file -> Releases all process locks on that file.
Exclusive Lock requires write permission of fd.

Permission bits:
```
000 000 000 000
1 setuid bit; 2 setgid bit; 3 sticky bit; 4~6 user permissions; 7~9 group permissions; 10~12 other permissions
```

Kernel 在檢查進程能否存取一個檔案時，會查看：
1. Effective 是否等於 0（root）
2. Effective UID 是否等於 st_uid，是則檢查該身份權限
3. Effective GID / Supplementary GID 其一是否等於 st_gid，是則檢查該身份權限
4. 檢查 other 權限
若權限為 `r--rwxrwx` 那 Owner 嘗試執行檔案，Kernel 在比對到 Owner 時發現不合法就會中止。

如果一個資料夾設定了 Sticky Bit，那麼除非使用者擁有資料夾的寫入權限，並且：使用者擁有該檔案 or 使用者擁有該資料夾 or 使用者是 root ，才可以刪除該資料夾下的檔案。

| Permission | Meaning for directory               |
| ---------- | ----------------------------------- |
| `r`        | List directory entries              |
| `w`        | Add/remove/rename directory entries |
| `x`        | Search/traverse directory           |

- `r` without `x`: Can potentially list names but cannot access entries by name.
- `x` without `r`: Can access a known filename but cannot list directory entries.
- `w` without `x`: Cannot normally create/delete entries because directory traversal is required.
- Deleting a file depends on the parent directory's permissions, not the file's write permission (subject to sticky-bit restrictions).

| Function                          | Referenced file/directory atime | mtime | ctime | Parent directory atime | mtime | ctime | Note                       |
| --------------------------------- | :-----------------------------: | :---: | :---: | :--------------------: | :---: | :---: | -------------------------- |
| `chmod`, `fchmod`                 |                                 |       |   ✓   |                        |       |       |                            |
| `chown`, `fchown`                 |                                 |       |   ✓   |                        |       |       |                            |
| `creat`                           |                ✓                |   ✓   |   ✓   |                        |   ✓   |   ✓   | `O_CREAT` new file         |
| `creat`                           |                                 |   ✓   |   ✓   |                        |       |       | `O_TRUNC` existing file    |
| `exec`                            |                ✓                |       |       |                        |       |       |                            |
| `lchown`                          |                                 |       |   ✓   |                        |       |       |                            |
| `link`                            |                                 |       |   ✓   |                        |   ✓   |   ✓   | Parent of second argument  |
| `mkdir`                           |                ✓                |   ✓   |   ✓   |                        |   ✓   |   ✓   |                            |
| `mkfifo`                          |                ✓                |   ✓   |   ✓   |                        |   ✓   |   ✓   |                            |
| `open`                            |                ✓                |   ✓   |   ✓   |                        |   ✓   |   ✓   | `O_CREAT` new file         |
| `open`                            |                                 |   ✓   |   ✓   |                        |       |       | `O_TRUNC` existing file    |
| `pipe`                            |                ✓                |   ✓   |   ✓   |                        |       |       |                            |
| `read`                            |                ✓                |       |       |                        |       |       |                            |
| `remove`                          |                                 |       |   ✓   |                        |   ✓   |   ✓   | Remove file = `unlink`     |
| `remove`                          |                                 |       |       |                        |   ✓   |   ✓   | Remove directory = `rmdir` |
| `rename`                          |                                 |       |   ✓   |                        |   ✓   |   ✓   | For both arguments         |
| `rmdir`                           |                                 |       |       |                        |   ✓   |   ✓   |                            |
| `truncate`, `ftruncate`           |                                 |   ✓   |   ✓   |                        |       |       |                            |
| `unlink`                          |                                 |       |   ✓   |                        |   ✓   |   ✓   |                            |
| `utimes`, `utimensat`, `futimens` |                ✓                |   ✓   |   ✓   |                        |       |       |                            |
| `write`                           |                                 |   ✓   |   ✓   |                        |       |       |                            |

| Function   | Does NOT follow symbolic link | Follows symbolic link |
| ---------- | :---------------------------: | :-------------------: |
| `access`   |                               |           ✓           |
| `chdir`    |                               |           ✓           |
| `chmod`    |                               |           ✓           |
| `chown`    |                               |           ✓           |
| `creat`    |                               |           ✓           |
| `exec`     |                               |           ✓           |
| `lchown`   |               ✓               |                       |
| `link`     |                               |           ✓           |
| `lstat`    |               ✓               |                       |
| `open`     |                               |           ✓           |
| `opendir`  |                               |           ✓           |
| `pathconf` |                               |           ✓           |
| `readlink` |               ✓               |                       |
| `remove`   |               ✓               |                       |
| `rename`   |               ✓               |                       |
| `stat`     |                               |           ✓           |
| `truncate` |                               |           ✓           |
| `unlink`   |               ✓               |                       |

| System call                           | What it checks                                                  | Permission checked                                                   | Which credentials?                               |
| ------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| `access(path, mode)`                  | Whether the calling process can access a file                   | `R_OK`, `W_OK`, `X_OK`, `F_OK`                                       | Real UID / GID                                   |
| `faccessat(dirfd, path, mode, flags)` | Similar to `access()`, relative to a directory FD               | `R_OK`, `W_OK`, `X_OK`, `F_OK`                                       | Real UID / GID by default; flags can change this |
| `open(path, flags)`                   | Whether the process can open a file                             | Read/write permissions according to `O_RDONLY`, `O_WRONLY`, `O_RDWR` | Effective UID / GID                              |
| `execve(path, argv, envp)`            | Whether the process can execute a file                          | Execute permission (`x`)                                             | Effective UID / GID                              |
| `chdir(path)`                         | Whether the process can enter a directory                       | Execute permission (`x`) on directory                                | Effective UID / GID                              |
| `opendir(path)`                       | Whether the process can open a directory for reading            | Read permission (`r`) and search permission (`x`)                    | Effective UID / GID                              |
| `mkdir(path, mode)`                   | Whether the process can create an entry in the parent directory | Write (`w`) + execute (`x`) on parent directory                      | Effective UID / GID                              |
| `unlink(path)`                        | Whether the process can remove a directory entry                | Write (`w`) + execute (`x`) on parent directory                      | Effective UID / GID                              |
| `rename(old, new)`                    | Whether the process can rename directory entries                | Write (`w`) + execute (`x`) on relevant parent directories           | Effective UID / GID                              |
| `stat(path)`                          | Retrieves file metadata                                         | Does not check file read/write/execute permissions                   | Not applicable                                   |

**TOCTOU = Time Of Check To Time Of Use**，Solution: open with `O_NOFOLLOW` and use `fstat` to check st_uid afterwards.

當緩衝區滿了、程式呼叫 `fflush` 、呼叫 `fclose` 關閉檔案、正常結束時，才會將緩衝區內容用 Syscall 實際寫入檔案。（注：輸出到 terminal 的 `printf/puts` 等操作是當換行時，或讀取輸入時 flush 到 kernel）。若使用 `printf("hello")` 且未加 `\n`（或輸出被重導向至檔案改為 Full Buffering），`fork()` 時 User-space 的 stdio 緩衝區會被完整複製到子程序，導致父子程序各自 `exit()` 時**重複刷新印出兩次**。

| 系統呼叫              | 同步範圍            | 元資料 (Metadata / i-node) | 是否阻塞等待磁碟 I/O 完成          |
| ----------------- | --------------- | ----------------------- | ------------------------ |
| **sync()**        | **全系統所有修改過的區塊** | 同步                      | **非阻塞（僅將區塊排入寫入佇列便立即回傳）** |
| **fsync(fd)**     | **指定檔案之資料**     | **強制同步 i-node 元資料**     | **阻塞等待磁碟寫入完成才回傳**        |
| **fdatasync(fd)** | **指定檔案之資料**     | 僅在影響資料讀取時同步（如檔案大小變更）    | **阻塞等待磁碟寫入完成才回傳**        |

#### Process

當 `execve()` 執行 set-UID executable 時，會將 executable owner 的 UID 設為 EUID，接著將新的 EUID 複製到 Saved UID。

| 屬性                        | `exec` 後是否保留                                   |
| ------------------------- | ---------------------------------------------- |
| PID                       | Yes                                            |
| Effective ID              | Yes, unless suid/sgid is set on the executable |
| Real ID                   | Yes                                            |
| Address Space             | No                                             |
| Open FDs                  | Yes, unless `F_CLOEXEC` is set                 |
| Current Working Directory | Yes                                            |
| Environment Vars          | Yes, unless `e` is part of `exec`.             |
| POSIX File Locks          | Yes                                            |

| Item                      | `fork` Inherited? | Reason                                                    |
| ------------------------- | ----------------- | --------------------------------------------------------- |
| Global variables          | Yes               | Part of the process's memory                              |
| Local variables           | Yes               | Part of the process's memory                              |
| Heap memory               | Yes               | Part of the process's memory                              |
| Environment variables     | Yes               | Represented in the process's memory                       |
| File descriptors          | Yes               | The child receives copies of the descriptor table entries |
| Current working directory | Yes               | The child inherits the directory state                    |
| Signal mask               | Yes               | Explicitly inherited                                      |

| 行為                  | `exit()` | `_Exit()`    | `_exit()`    |
| ------------------- | -------- | ------------ | ------------ |
| 定義標準                | ISO C    | ISO C（C99 起） | POSIX        |
| 執行 `atexit()` 註冊的函式 | 是        | 否            | 否            |
| 刷新 `stdio` 緩衝區      | 是        | 否            | 否            |
| 關閉 `stdio` streams  | 是        | 不執行標準 I/O 清理 | 不執行標準 I/O 清理 |
| 關閉進程的檔案描述符          | 是，經由終止程序 | 是，經由終止程序     | 是            |
| 終止進程                | 是        | 是            | 是            |

 `waitpid` 會根據傳入的 `pid` 改變行為：
- `pid == -1`：等待所有子進程
- `pid > 0` ：等待指定的子進程 `pid`
- `pid == 0`：等待所有與 parent 擁有相同 `group id` 的子進程
- `pid < -1`：等待所有 `group id == |pid|` 的子進程

`option` 可以是以下多個值 bitwise OR：
- `WNOHANG`：Don't wait if there's nothing to report.
- `WUNTRACED`：Also report stopped children.
- `WCONTINUED`：Also report resumed children.
```c
int status; waitpid(-1, &status, 0);
if (WIFEXITED(status)) int exit_code = WEXITSTATUS(status);
```

Pipe IO 操作的行為會根據有沒有另一端而有所不同：

| Reader/Writer     | `read` 結果          | `write` 結果                          |
| ----------------- | ------------------ | ----------------------------------- |
| 有 Reader 有 Writer | 有資料就讀，沒資料就阻塞       | 有空間就寫，空間滿時阻塞                        |
| 有 Reader 沒 Writer | 有資料就讀，沒資料回傳 0（EOF） | X                                   |
| 沒 Reader 有 Writer | X                  | 觸發 `SIGPIPE`，寫入進程異常中止，`errno=EPIPE` |
| 沒 Reader 沒 Writer | Pipe 關閉            | Pipe 關閉                             |

Pipe 開啟 `O_NONBLOCK` 後行為也會改變：

| Reader/Writer     | `read` 結果          | `write` 結果            |
| ----------------- | ------------------ | --------------------- |
| 有 Reader 有 Writer | 沒資料回傳 `EAGAIN`     | 空間滿時可能 `EAGAIN` 或部份寫入 |
| 有 Reader 沒 Writer | 有資料就讀，沒資料回傳 0（EOF） | X                     |
| 沒 Reader 有 Writer | X                  | 觸發 `SIGPIPE`          |
| 沒 Reader 沒 Writer | Pipe 關閉            | Pipe 關閉               |

FIFO:

| 開啟方式                                 | 沒有對應的另一端時                     |
| ------------------------------------ | ----------------------------- |
| `open(FIFO, O_RDONLY)`               | 阻塞等待 Writer                   |
| `open(FIFO, O_WRONLY)`               | 阻塞等待 Reader                   |
| `open(FIFO, O_RDONLY \| O_NONBLOCK)` | 立即成功                          |
| `open(FIFO, O_WRONLY \| O_NONBLOCK)` | 立即失敗，回傳 `-1`， `errno = ENXIO` |

For fixed data size $D$, buffer size $B$: $N_{\text{write}} \approx \frac{D}{B}$ , $T_{\text{system}} \approx N_{\text{write}}C_{\text{call}} + D C_{\text{data}}$ 

| Strategy                 | User CPU                             | System CPU                                  |
| ------------------------ | ------------------------------------ | ------------------------------------------- |
| Blocking I/O             | Usually less busy-waiting            | Syscall overhead                            |
| Nonblocking busy polling | Potentially higher                   | Potentially higher due to repeated syscalls |
| Multiplexing             | Can sleep while waiting              | Avoids repeated polling syscalls            |
| Buffered stdio           | Extra user-space copying/bookkeeping | Depends on actual `write()` calls           |

Binary I/O portability: Endianness, sizeof(type), Struct padding/alignment, Floating-point representation

Compare the actual number and size of `write()` calls:
- If buffering batches many small writes into fewer large writes, system CPU time can decrease.
- If both approaches already issue equivalent large writes, syscall counts may be similar.
- User-space buffering can add copying and bookkeeping overhead, but that is primarily user CPU time.

Binary I/O do not automatically create a portable file format. Reasons: Different endianne. Different sizes of data types. Different structure padding and alignment. Different representations of floating-point values.

Deadlock: A set of processes is deadlocked if each process is waiting for an event/resource that can only be caused/released by another process in the set.