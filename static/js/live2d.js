const CANVAS_ID = 'live2d-canvas';
const MODEL_PATH = '/l2d_models/MINTO/MINTO.model3.json';

function initPIXIApplication(id) {
    window.app = new PIXI.Application({
        view: document.getElementById(id),
        autoStart: true,
        backgroundAlpha: 0,
        resizeTo: document.getElementById(id)
    });

    window.onresize = () => {
        resizeModel();
    };
}

function loadModelToStage(path) {
    if (!window.app) return;
    if (window.model) window.app.stage.removeChild(window.model);

    PIXI.live2d.Live2DModel.from(path).then(model => {
        window.app.stage.addChild(model);
        window.model = model;
        resizeModel();
    });
}


function resizeModel() {
    if (!window.model) return;
    if (!window.app) return;

    window.model.scale.set(1);
    const scaleX = window.app.view.clientWidth / window.model.width;
    const scaleY = window.app.view.clientHeight / window.model.height;
    window.model.scale.set(Math.min(scaleX, scaleY));
    window.model.x = (window.app.view.clientWidth - window.model.width) / 2;
    window.model.y = (window.app.view.clientHeight - window.model.height) / 2;
}

function createCanvas() {
    let container = document.createElement('div');
    container.className = 'canvas-container';
    container.title = '著作權權利所屬 角色的權利由草莓電波＿醬醬作者本人持有。'
    let canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    container.appendChild(canvas);
    $('body').appendChild(container);
}

window.onload = () => {
    createCanvas();
    initPIXIApplication(CANVAS_ID);
    loadModelToStage(MODEL_PATH);
};
