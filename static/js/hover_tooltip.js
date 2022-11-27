let postContent = document.querySelector('div.post-content');
postContent.innerHTML = postContent.innerHTML.replace(/{([^,{}]+),([^,}]+),{0,1}([^,}]{0,})}/gm, (match, p1, p2, p3) => {
    let tip = document.createElement('tips');
    tip.classList.add('tooltip');
    tip.innerHTML = p1;

    let span = document.createElement('span');
    span.className = 'tooltip-text';
    span.innerHTML = p2;
    tip.title = p2.replace(/<\/{0,1}\w{0,}>/gm, (match) => {
        if (match === '<br>')
            return '\n';
        return '';
    });  // considering removing?

    if (p3 !== "") {
        tip.style.borderColor = p3;
    }

    tip.appendChild(span);
    return tip.outerHTML;
});

let tips = document.getElementsByTagName('tips');
for (let tip of tips) {
    if (!hasChildNodesExcludingText(tip)) {
        tip.classList.add('tooltip');

        let span = document.createElement('span');
        span.className = 'tooltip-text';
        span.innerHTML = tip.dataset.c;
        tip.title = tip.dataset.c.replace(/<\/{0,1}\w{0,}>/gm, (match) => {
            if (match === '<br>')
                return '\n';
            return '';
        });  // considering removing?

        if (tip.dataset.u) {
            tip.style.borderColor = tip.dataset.u;
        }

        tip.appendChild(span);
    }

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
