function SmoothScroll(e,t,l){e===document&&(e=document.scrollingElement||document.documentElement||document.body.parentNode||document.body);let n=!1,o=e.scrollTop,i=e===document.body&&document.documentElement?document.documentElement:e;function a(a){var s;a.preventDefault(),o+=-(s=a,s.detail?s.wheelDelta?s.wheelDelta/s.detail/40*(s.detail>0?1:-1):-s.detail/3:s.wheelDelta/120)*t,o=Math.max(0,Math.min(o,e.scrollHeight-i.clientHeight)),n||function t(){n=!0;let i=(o-e.scrollTop)/l;e.scrollTop+=i,Math.abs(i)>.5?m(t):n=!1}()}e.addEventListener("mousewheel",a,{passive:!1}),e.addEventListener("DOMMouseScroll",a,{passive:!1});let m=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){window.setTimeout(e,20)}}