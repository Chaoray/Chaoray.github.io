const $ = (s, t = document.body) => t.querySelector(s);

window.addEventListener('load', () => {
    parseSpoilerTags($('article > section.article-content'));
});

function parseSpoilerTags(element) {
    element.innerHTML = element.innerHTML.replaceAll(/\|\|(.+)\|\|/g, (match, content) => {
        return createSpoilerElement(content).outerHTML;
    });
}

function createSpoilerElement(content) {
    let span = document.createElement('span');
    span.innerHTML = content;
    span.classList.add('spoiler');
    span.title = '你知道的太多了';
    return span;
}
