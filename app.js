function drawVideo(video, canvas, canvasContext) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(() => drawVideo(video, canvas, canvasContext));
}

document.addEventListener('DOMContentLoaded', async () => {
    const video = document.createElement('video');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    await video.play();

    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    drawVideo(video, canvas, context);
});
