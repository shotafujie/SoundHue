const audioFileInput = document.getElementById('audioFile');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let audioContext = new AudioContext();
let analyser = audioContext.createAnalyser();
let source;
let audioBuffer; 
let dataArray;

let isPlaying = false; 

function createSource() {
    if (source) {
        source.disconnect(); // 既存のsourceがあれば切断します。
    }
    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
}

audioFileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (fileEvent) {
        const arrayBuffer = fileEvent.target.result;
        audioContext.decodeAudioData(arrayBuffer, function (buffer) {
            audioBuffer = buffer; 
            createSource(); 
        });
    };
    reader.readAsArrayBuffer(file);
});

playButton.addEventListener('click', function() {
    if (!isPlaying) {
        createSource(); 
        audioContext.resume().then(() => {
            source.start(0);
            isPlaying = true;
        });
    }
});

stopButton.addEventListener('click', function() {
    if (isPlaying) {
        source.stop();
        isPlaying = false;
    }
});

function getColorForFrequency(frequency) {
    if (frequency < 500) {
        return 'rgb(148, 0, 211)';  // 紫
    } else if (frequency < 1000) {
        return 'rgb(75, 0, 130)';   // 暗紫
    } else if (frequency < 1500) {
        return 'rgb(0, 0, 255)';    // 青
    } else if (frequency < 2000) {
        return 'rgb(0, 255, 255)';  // シアン
    } else if (frequency < 2500) {
        return 'rgb(0, 255, 0)';    // 緑
    } else if (frequency < 3000) {
        return 'rgb(255, 255, 0)';  // 黄色
    } else if (frequency < 3500) {
        return 'rgb(255, 127, 0)';  // オレンジ
    } else if (frequency < 4000) {
        return 'rgb(255, 0, 0)';    // 赤
    } else if (frequency < 4500) {
        return 'rgb(255, 50, 50)';  // 明るい赤
    } else if (frequency < 5000) {
        return 'rgb(255, 100, 100)';// より明るい赤
    } else if (frequency < 5500) {
        return 'rgb(255, 150, 150)';// さらに明るい赤
    } else if (frequency < 6000) {
        return 'rgb(255, 200, 200)';// ほんのり赤
    } else if (frequency < 6500) {
        return 'rgb(255, 225, 225)';// かすかに赤
    } else {
        return 'rgb(255, 245, 245)';// ほとんど白
    }
}


analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
dataArray = new Uint8Array(bufferLength);

function drawWaveform() {
    requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.beginPath(); 

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(i, y);
        }

        const frequency = i * audioContext.sampleRate / analyser.fftSize;
        ctx.strokeStyle = getColorForFrequency(frequency);
    }

    ctx.stroke(); // 
}
function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        const frequency = i * audioContext.sampleRate / analyser.fftSize;
        ctx.fillStyle = getColorForFrequency(frequency);
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}



drawWaveform();
draw();


