const sampleSize = 8;
let previousSample;

class RgbSample {
    constructor(context, imageWidth, imageHeight, sampleSize) {
        this.data = [];

        const cols = Math.floor(imageWidth / sampleSize);
        const rows = Math.floor(imageHeight / sampleSize);

        for (let col=0; col<cols; col++) {
            this.data[col] = [];
            for (let row=0; row<rows; row++) {
                const { data } = context.getImageData(col * sampleSize, row * sampleSize, sampleSize, sampleSize);

                let rSum = 0;
                let gSum = 0;
                let bSum = 0;

                for (let i=0; i<data.length; i+=4) {
                    rSum += data[i];
                    gSum += data[i+1];
                    bSum += data[i+2];
                }

                this.data[col].push({
                    r: Math.floor(rSum/sampleSize/sampleSize),
                    g: Math.floor(gSum/sampleSize/sampleSize),
                    b: Math.floor(bSum/sampleSize/sampleSize),
                });
            }
        }
    }

    getDiffAreas(anotherSample, delta) {
        const areas = [];

        for (let col=0; col<this.data.length; col++) {
            for(let row=0; row<this.data[0].length; row++) {
                const rDiff = Math.abs(this.data[col][row].r - anotherSample.data[col][row].r);
                const gDiff = Math.abs(this.data[col][row].g - anotherSample.data[col][row].g);
                const bDiff = Math.abs(this.data[col][row].b - anotherSample.data[col][row].b);

                if ((rDiff + gDiff + bDiff) > delta) {
                    areas.push([col, row]);
                }
            }
        }

        return areas;
    }
}


async function drawVideo(video, { width, height }, canvasContext) {
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.drawImage(video, 0, 0, width, height);
    const rgbSample = new RgbSample(canvasContext, width, height, sampleSize);

    if (previousSample) {
        const diffAreas = rgbSample.getDiffAreas(previousSample, 30);
        diffAreas.forEach(([col, row]) => {
            const x = col * sampleSize + sampleSize / 2;
            const y = row * sampleSize + sampleSize / 2;

            canvasContext.beginPath();
            canvasContext.fillStyle = 'white';
            canvasContext.arc(x, y, sampleSize/3, 0, 2*Math.PI);
            canvasContext.fill();
        });
    }

    previousSample = rgbSample;
    requestAnimationFrame(() => drawVideo(video, { width, height }, canvasContext));
}

document.addEventListener('DOMContentLoaded', async () => {
    const video = document.createElement('video');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    await video.play();

    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    await drawVideo(video, canvas, context);
});
