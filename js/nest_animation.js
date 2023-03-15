{
    class NestAnimation {
        constructor(
            canvasId,
            {
                squareCount,
                squareColorRGB,
                squareLength,
                speed,
                linkRadius,
            }, {
                mouseRadius,
                mouseGraspSpeed,
            }) {
            this.id = canvasId;
            this.canvas = document.getElementById(this.id);
            this.context = this.canvas.getContext('2d');

            this.squares = [];
            this.squareConfigs = {
                speed: speed,
                count: squareCount,
                color: squareColorRGB,
                length: squareLength,
                radius: linkRadius,
            };

            this.mouseConfigs = {
                radius: mouseRadius,
                graspSpeed: mouseGraspSpeed,
            };

            this.init();
        }

        /**
         * This shouldn't be called outside this class
         */
        draw() {
            this.context.clearRect(0, 0, this.width, this.height);

            let length = this.squareConfigs.length;
            let color = this.squareConfigs.color;
            let dx, dy, distance, ratio;

            this.context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;

            for (let curr of this.squares) {
                curr.x += curr.xa;
                curr.y += curr.ya;

                curr.xa = curr.xa * (curr.x > this.width || curr.x < 0 ? -1 : 1);
                curr.ya = curr.ya * (curr.y > this.height || curr.y < 0 ? -1 : 1);

                this.context.fillRect(curr.x - length / 2, curr.y - length / 2, length, length);

                for (let other of this.squares) {
                    dx = curr.x - other.x;
                    dy = curr.y - other.y;
                    distance = dx * dx + dy * dy;
                    if (distance < other.radius) {
                        ratio = (other.radius - distance) / other.radius;
                        this.context.beginPath();
                        this.context.lineWidth = ratio / 2;
                        this.context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${ratio})`;
                        this.context.moveTo(curr.x, curr.y);
                        this.context.lineTo(other.x, other.y);
                        this.context.stroke();
                    }
                }
            }

            window.requestAnimationFrame(this.draw.bind(this));
        }

        init() {
            this.resize();

            if (document.documentElement.dataset.scheme) {
                let scheme = document.documentElement.dataset.scheme;
                if (scheme == 'dark') {
                    this.setColor({ r: 255, g: 255, b: 255 });
                } else {
                    this.setColor({ r: 0, g: 0, b: 0 });
                }
            }

            for (let i = 0; i < this.squareConfigs.count; i++) {
                let x = Math.random() * this.width;
                let y = Math.random() * this.height;
                let xa = this.squareConfigs.speed * Math.random() - 1;
                let ya = this.squareConfigs.speed * Math.random() - 1;
                this.squares.push({
                    x: x,
                    y: y,
                    xa: xa,
                    ya: ya,
                    radius: this.squareConfigs.radius,
                });
            }

            this.mouse = {
                x: null,
                y: null,
                radius: this.mouseConfigs.radius,
            };

            this.canvas.onmousemove = (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
            };

            this.canvas.onmouseout = () => {
                this.mouse.x = null;
                this.mouse.y = null;
            };
        }

        resize() {
            this.width = this.canvas.offsetWidth;
            this.height = this.canvas.scrollHeight;

            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.scrollHeight;
        }

        setColor(color) {
            this.squareConfigs.color = color;
        }

        applyAnimation() {
            this.draw();
        }
    }

    let nest;

    window.addEventListener('load', (e) => {
        let canvas = document.createElement('canvas');
        canvas.id = 'nest-canvas';
        $('body').appendChild(canvas);

        nest = new NestAnimation(
            'nest-canvas',
            {
                squareCount: 99,
                squareLength: 1,
                squareColorRGB: {
                    r: 0, g: 0, b: 0
                },
                speed: 2,
                linkRadius: 6000
            },
            {
                mouseRadius: 20000,
                mouseGraspSpeed: 0.03
            });

        nest.applyAnimation();
    });

    window.addEventListener('resize', (e) => {
        if (!nest) return;

        nest.resize();
    });

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!nest) return;
            if (!mutation.target.dataset.scheme) return;
            let scheme = mutation.target.dataset.scheme;
            if (scheme == 'dark') {
                nest.setColor({ r: 255, g: 255, b: 255 });
            } else {
                nest.setColor({ r: 0, g: 0, b: 0 });
            }

        });
    });

    observer.observe(document.documentElement, {
        attributes: true
    });
}