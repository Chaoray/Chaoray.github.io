---
title: "Discord Bot 模板"
date: 2023-02-05T17:32:11+08:00
tags: ['js', 'discord']
image: title.png
---

從0開始做個dc機器人本來就蠻花時間，而且如果是初學者那更不知道要從哪開始  
所以把過往寫機器人的一些管理技巧整理整理，變成一個模板，不用直接from scratch

---

我主要是朝向模組化開發，因為我看很多人在寫bot，都把`event`、`command`都塞在`main.js`裡面  
指令的判斷也是用`if...else`實作，不好管理還難閱讀  

用`require`，把每個指令拆成一個檔案，動態載入，刪減也很方便  
```
+---commands
|       help.js
|       ping.js
```

然後slash command我沒有照一般application commands要註冊，而是在加入伺服器時直接設定  
離開再刪除
```js
// events\guildCreate.js

const { Events, } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        guild.commands.set(guild.client.slashCommands.map((command) => command.data));
    },
};

// events\guildDelete.js
module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        guild.commands.set([]);
    },
};
```

Repo連結：[Chaoray/DiscordBotTemplate](https://github.com/Chaoray/DiscordBotTemplate)