let tips = document.getElementsByTagName('tips');
// Object.prototype.offset = (type = 'all') => {
//     let e = this; let d = { height: this.offsetHeight, width: this.offsetWidth, top: 0, left: 0 };
//     while (e !== document.body && e.offsetParent) {
//         d.left += e.offsetLeft;
//         d.top += e.offsetTop;
//         e = e.offsetParent;
//     }
//     return (type in d ? d[type] : d);
// }

for (let tip of tips) {
    tip.classList.add('tooltip');

    let span = document.createElement('span');
    span.className = 'tooltip-text';
    span.innerHTML = tip.dataset.c;

    if (tip.dataset.u) {
        tip.style.borderColor = tip.dataset.u;
    }

    tip.appendChild(span);

    tip.addEventListener('mouseover', (e) => {
        e.stopPropagation();
        tip.setAttribute('hovered', '');
    });
    tip.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        tip.removeAttribute('hovered');
    });
}

let html = document.querySelector('html');
setTimeout(() => {//這樣
    for (let tip of tips) {
        let tipText = tip.querySelector('.tooltip-text');
        console.log(tipText.getBoundingClientRect().top - html.scrollTop);
        // 測試捲動後是否為定值..............
        tipText.style.top = `calc(${tipText.getBoundingClientRect().top - 17/* tip高 */ - html.scrollTop}px - 0.4em)`;
        tipText.style.left = `${tipText.getBoundingClientRect().left - html.scrollLeft}px`;
    }
}, 1e3);