var MicRecorderWorker = (function () {
    function MicRecorderWorker(_self) {
        this._self = _self;
        this._recordingLength = 0;
        this._recordingBuffers = new Array();
        this._bitsPerSample = 16;
    }
    MicRecorderWorker.prototype.init = function (config) {
        this._sampleRate = config.sampleRate;
        this._numberOfChannels = config.numberOfChannels;
        //this._blockAlign = this._numberOfChannels * 2; /*block align (channel count * bytes per sample)*/
        this.initBuffers();
    };
    MicRecorderWorker.prototype.initBuffers = function () {
        for (var channel = 0; channel < this._numberOfChannels; channel++) {
            this._recordingBuffers[channel] = new Array();
        }
    };
    /*Ogni elemento in recordingBuffers corrisponde ad un singolo buffer con sua lunghezza.
    Questa funzione prende ogni singolo buffer e li mette in fila uno dopo l'altro*/
    MicRecorderWorker.prototype.mergeBuffers = function (recordingBuffers, recordingLength) {
        var result = new Float32Array(recordingLength);
        var offset = 0;
        for (var i = 0; i < recordingBuffers.length; i++) {
            result.set(recordingBuffers[i], offset);
            offset += recordingBuffers[i].length;
        }
        return result;
    };
    /*Prende i due risultati del merge e fa l'interleave*/
    MicRecorderWorker.prototype.interleave = function (inputL, inputR) {
        var length = inputL.length + inputR.length;
        var result = new Float32Array(length);
        var index = 0, inputIndex = 0;
        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
        }
        return result;
    };
    /*DataViews are how you interact with ArrayBuffer:
    The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer.
    You can not directly manipulate the contents of an ArrayBuffer;
    instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format,
    and use that to read and write the contents of the buffer.*/
    MicRecorderWorker.prototype.floatTo16BitPCM = function (output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, input[i])); //Clamping!!
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };
    MicRecorderWorker.prototype.writeString = function (view, offset, stringToWrite) {
        for (var i = 0; i < stringToWrite.length; i++) {
            view.setUint8(offset + i, stringToWrite.charCodeAt(i));
        }
    };
    MicRecorderWorker.prototype.encodeWav = function (samples) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
        /*RIFF identifier*/
        this.writeString(view, 0, 'RIFF');
        /*RIFF chunk length*/
        view.setUint32(4, 36 + samples.length * 2, true);
        /*RIFF type*/
        this.writeString(view, 8, 'WAVE');
        /*format chunk identifier*/
        this.writeString(view, 12, 'fmt ');
        /*format chunk length*/
        view.setUint32(16, 16, true);
        /*sample format (raw)*/
        view.setUint16(20, 1, true);
        /*channel count*/
        view.setUint16(22, this._numberOfChannels, true);
        /*sample rate*/
        view.setUint32(24, this._sampleRate, true);
        /*byte rate (sample rate * block align)*/
        view.setUint32(28, this._sampleRate * 4, true);
        /*block align (channel count * bytes per sample)*/
        view.setUint16(32, this._numberOfChannels * 2, true);
        /*bits per sample*/
        view.setUint16(34, 16, true);
        /*data chunk identifier*/
        this.writeString(view, 36, 'data');
        /*data chunk length*/
        view.setUint32(40, samples.length * 2, true);
        this.floatTo16BitPCM(view, 44, samples);
        return view;
    };
    MicRecorderWorker.prototype.exportWAV = function (type) {
        var buffers = new Array();
        for (var channel = 0; channel < this._numberOfChannels; channel++) {
            buffers.push(this.mergeBuffers(this._recordingBuffers[channel], this._recordingLength));
        }
        /*console.log('Merged buffers: ');
        console.log(buffers[0]);*/
        if (this._numberOfChannels === 2) {
            var interleaved = this.interleave(buffers[0], buffers[1]);
        }
        else {
            var interleaved = buffers[0];
        }
        /*console.log('Interleaved buffers: ');
        console.log(interleaved);*/
        var dataView = this.encodeWav(interleaved);
        var audioBlob = new Blob([dataView], { type: type });
        //console.log(audioBlob);
        this._self.postMessage(audioBlob);
    };
    MicRecorderWorker.prototype.getBuffer = function () {
        var buffers = new Array();
        for (var channel = 0; channel < this._numberOfChannels; channel++) {
            buffers.push(this.mergeBuffers(this._recordingBuffers[channel], this._recordingLength));
        }
        this._self.postMessage(buffers);
    };
    MicRecorderWorker.prototype.record = function (inputBuffer) {
        for (var channel = 0; channel < this._numberOfChannels; channel++) {
            this._recordingBuffers[channel].push(inputBuffer[channel]);
        }
        this._recordingLength += inputBuffer[0].length;
        /*console.log('Recording length:' + this._recordingLength);
        console.log('Recording data:' + this._recordingBuffers[0]);*/
    };
    MicRecorderWorker.prototype.clear = function () {
        this._recordingLength = 0;
        this._recordingBuffers = new Array();
        this.initBuffers();
    };
    return MicRecorderWorker;
})();
var micRecorderWorker = new MicRecorderWorker(self);
self.addEventListener('message', function (event) {
    switch (event.data.command) {
        case 'init':
            micRecorderWorker.init(event.data.config);
            break;
        case 'record':
            micRecorderWorker.record(event.data.buffer);
            break;
        case 'getBuffer':
            micRecorderWorker.getBuffer();
            break;
        case 'exportWAV':
            micRecorderWorker.exportWAV(event.data.type);
            break;
        case 'clear':
            micRecorderWorker.clear();
            break;
        default:
            break;
    }
});
//# sourceMappingURL=micRecorderWorker.js.map