let postContent = document.querySelector('div.post-content');
postContent.innerHTML = postContent.innerHTML.replace(/{([^,{}]+),([^,}]+),{0,1}([^,}]{0,})}/g, (match, p1, p2, p3) => {
    let tip = document.createElement('tips');
    tip.classList.add('tooltip');
    tip.innerHTML = p1;

    tip.dataset.c = p2;

    if (p3 !== "") {
        tip.dataset.u = p3;
    }

    return tip.outerHTML;
});

let tips = document.getElementsByTagName('tips');
for (let tip of tips) {
    tip.classList.add('tooltip');

    let span = document.createElement('span');
    span.className = 'tooltip-text';
    span.innerHTML = tip.dataset.c;
    tip.title = tip.dataset.c.replace(/<\/{0,1}\w{0,}>/gm, (match) => {
        if (match === '<br>')
            return '\n';
        return '';
    });

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

function hasChildNodesExcludingText(node) {
    let hasChildElements = false, child;
    for (child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 1) {
            hasChildElements = true;
            break;
        }
    }
    return hasChildElements;
}
