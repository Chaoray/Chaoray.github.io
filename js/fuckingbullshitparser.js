let charts = document.querySelectorAll('div.post-content chart');

class Data2ChartConfig {
    constructor (data = "") {
        this.data = data.trim();
    }
    
    parseData2ConfigData_1(type) {
        // split lines
        let lines = this.data.split(/\r?\n/);

        // parsing labels
        let labels = lines[0].split(',').map((value) => {
           let label = value.trim().replace(/\'/g, ''); 
           return label;
        });

        // parsing datasets
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

    parseData2ConfigData_2(type) {}

    bar() {
        return this.parseData2ConfigData_1('bar');
    }

    doughnut() {
        return this.parseData2ConfigData_1('doughnut');
    }

    pie() {
        return this.parseData2ConfigData_1('pie');
    }

    line() {
        return this.parseData2ConfigData_1('line');
    }

    polararea() {
        return this.parseData2ConfigData_1('polarArea');
    }

    radar() {
        return this.parseData2ConfigData_1('radar');
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
    new Chart(canvas, parser[type]());
}
