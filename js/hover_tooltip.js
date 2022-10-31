let tips = document.getElementsByTagName('tips');

for (let i = 0; i < tips.length; i++) {
    let tip = tips[i];
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
        e.target.toggleAttribute('hovered');
    });
    tip.addEventListener('mouseleave', (e) => {
        e.stopPropagation();
        e.target.toggleAttribute('hovered');
    });
}
