let charts = document.querySelectorAll('div.post-content chart');

class Data2ChartConfig {
    constructor (data = "") {
        this.data = data.trim();
    }
    
    parseData2ConfigData_1(type) {
        // split lines
        let lines = this.data.split(/\r?\n/);

        // parse labels
        let labels = lines[0].split(',').map((value) => {
           let label = value.trim().replace(/\'/g, ''); 
           return label;
        });

        // parse datasets
        let rawDatasets = lines.slice(1, lines.length);
        let datasets = rawDatasets.map((value) => {
            let rawdata = value.split(',').map(v => v.trim().replace(/\'/g, ''));

            // split label
            let label = rawdata[0];

            // split data
            let data = rawdata.slice(1, rawdata.length).map(v => parseFloat(v));
            return {
                label: label,
                data: data
            };
        });

        return {
            type: type,
            data: {
                labels: labels,
                datasets: datasets
            }
        }
    }

    monkeyPatch(config, data) {
        Object.keys(config).forEach(key => {  // monkey patch chart config lol
            key.split('_').reduce((acc, curr, index, arr) => {
                if (index == arr.length - 1) {
                    acc[curr] = eval(config[key]);
                } else {
                    if (isNaN(parseInt(curr))) {
                        return acc[curr];
                    } else {
                        return acc[parseInt(curr)];
                    }
                }
            }, data.data);
        });
        console.log(data);
    }

    bar(config) {
        let chartData = this.parseData2ConfigData_1('bar');
        this.monkeyPatch(config, chartData);
        return chartData;
    }

    doughnut(config) {
        let chartData = this.parseData2ConfigData_1('doughnut');
        this.monkeyPatch(config, chartData);
        return chartData;
    }

    pie(config) {
        let chartData = this.parseData2ConfigData_1('pie');
        this.monkeyPatch(config, chartData);
        return chartData;
    }

    line(config) {
        let chartData = this.parseData2ConfigData_1('line');
        this.monkeyPatch(config, chartData);
        return chartData;
    }

    polararea(config) {
        let chartData = this.parseData2ConfigData_1('polarArea');
        this.monkeyPatch(config, chartData);
        return chartData;
    }

    radar(config) {
        let chartData = this.parseData2ConfigData_1('radar');
        this.monkeyPatch(config, chartData);
        return chartData;
    }

    bubble() {}

    scatter() {}
}

for (let chart of charts) {
    let type = chart.className;
    let data = chart.innerHTML;
    chart.innerHTML = "";

    let canvas = document.createElement('canvas');
    chart.appendChild(canvas);

    let parser = new Data2ChartConfig(data);
    new Chart(canvas, parser[type](chart.dataset));
}
