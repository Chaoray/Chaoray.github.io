let markmaps = document.querySelectorAll('div.post-content markmap');

for (let markmap of markmaps) {
    let md = markmap.innerHTML;
    markmap.innerHTML = "";

    let div = document.createElement('div');
    div.className = "markmap";
    let script = document.createElement('script');
    script.setAttribute('type', 'text/template');
    script.innerHTML = md;
    div.appendChild(script);
    markmap.appendChild(div);
}