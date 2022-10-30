---
title: "重要資訊"
draft: false
hidemeta: true
searchHidden: true
showtoc: false
---

<timer data-deadline="1668441600000" title="二抽 2022/11/15"></timer>
<table><tr><td>國文</td><td>L5~L6</td></tr><tr><td>英文</td><td>L4~L5</td></tr><tr><td>英聽</td><td></td></tr><tr><td>數學</td><td></td></tr><tr><td>歷史</td><td></td></tr><tr><td>公民</td><td></td></tr><tr><td>地科</td><td></td></tr><tr><td>物理</td><td>3-3~4-2</td></tr></table>

<timer data-deadline="1669737600000" title="二段 2022/11/30"></timer>
<timer data-deadline="1672761600000" title="三抽 2023/01/04"></timer>
<timer data-deadline="1673884800000" title="三段 2023/01/17"></timer>

<script>
  let timers = document.getElementsByTagName('timer');
  for (let i = 0; i < timers.length; i++) {
      let timer = timers[i];
      let title = document.createElement('h2');
      let timeDHMS = document.createElement('p');
      title.innerHTML = timer.title;
      timer.appendChild(title);
      timer.appendChild(timeDHMS);
      let deadline = new Date(parseInt(timer.dataset['deadline'])).getTime();
      setInterval(() => {
          timerEvent(timeDHMS, deadline)
      }, 999);
  }
  function timerEvent(ele, date) {
      let difference = date - new Date().getTime();
      let differenceInSeconds = Math.floor(difference / 1000);
      let d = Math.floor(differenceInSeconds / 86400);
      let h = Math.floor(Math.floor(differenceInSeconds % 86400) / 3600);
      let m = Math.floor(Math.floor(differenceInSeconds % 3600) / 60);
      let s = differenceInSeconds % 60;
      ele.innerHTML = `
        剩餘時間: 
        <b>${d}日</b>
        <b>${h}時</b>
        <b>${m}分</b>
        <b>${s}秒</b>`;
  }
</script>

