{
    const CANVAS_ID = 'live2d-canvas';
    const MODEL_PATH = '/l2d_models/mao_pro_t02/mao_pro_t02.model3.json';
    let app, model;

    function initPIXIApplication(id) {
        app = new PIXI.Application({
            view: document.getElementById(id),
            autoStart: true,
            backgroundAlpha: 0,
            resizeTo: document.getElementById(id)
        });

        window.addEventListener('resize', () => {
            resizeModel();
        });
    }

    function loadModelToStage(path) {
        if (!app) return;
        if (model) app.stage.removeChild(model);

        PIXI.live2d.Live2DModel
            .from(path, {
                idleMotionGroup: 'Idle',
                motionPreload: PIXI.live2d.MotionPreloadStrategy.IDLE
            })
            .then(_model => {
                app.stage.addChild(_model);
                model = _model;
                resizeModel();

                model.on('hit', (hitAreaNames) => {
                    if (hitAreaNames.includes('head')) {
                        model.expression();
                    } else if (hitAreaNames.includes('body')) {
                        model.motion('mtn');
                    }
                });
            });
    }

    function resizeModel() {
        if (!model) return;
        if (!app) return;

        model.scale.set(1);
        const scaleX = app.view.clientWidth / model.width;
        const scaleY = app.view.clientHeight / model.height;
        model.scale.set(Math.min(scaleX, scaleY));
        model.x = (app.view.clientWidth - model.width) / 2;
        model.y = (app.view.clientHeight - model.height) / 2;
    }

    function createCanvas() {
        let container = document.createElement('div');
        container.className = 'canvas-container';

        let canvas = document.createElement('canvas');
        canvas.id = CANVAS_ID;

        container.appendChild(canvas);
        $('body').appendChild(container);
    }

    window.addEventListener('load', () => {
        createCanvas();
        initPIXIApplication(CANVAS_ID);
        loadModelToStage(MODEL_PATH);
    })
}
