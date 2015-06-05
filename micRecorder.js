/// <reference path="scripts/typings/webaudioapi/waa.d.ts" />
/*Reference recorder.js https://github.com/mattdiamond/Recorderjs*/
var micRecorder = (function () {
    function micRecorder(_source, _config) {
        if (_config === void 0) { _config = {
            bufferLength: 4096,
            numberOfChannels: 1,
            workerPath: 'micRecorderWorker.js'
        }; }
        this._source = _source;
        this._config = _config;
        this._context = _source.context;
        this._node = this._context.createScriptProcessor(this._config.bufferLength, this._config.numberOfChannels, this._config.numberOfChannels);
        this._worker = new Worker(_config.workerPath);
        this._bIsRecording = false;
        this._worker.postMessage({
            command: 'init',
            config: {
                sampleRate: this._context.sampleRate,
                numberOfChannels: this._config.numberOfChannels
            }
        });
        this._node.addEventListener('audioprocess', function (event) {
            (function (bIsRecording, numberOfChannels, event, worker) {
                if (!bIsRecording) {
                    return;
                }
                var buffer = new Array();
                for (var channel = 0; channel < numberOfChannels; channel++) {
                    buffer.push(event.inputBuffer.getChannelData(channel));
                }
                worker.postMessage({
                    command: 'record',
                    buffer: buffer
                });
            })(this._bIsRecording, 1, event, this._worker);
        }.bind(this));
        this._worker.addEventListener('message', function (event) {
            (function (event, currentCallback) {
                var blob = event.data;
                console.log(blob);
                //console.log(currentCallback);
                currentCallback(blob);
            })(event, this._currentCallback);
        }.bind(this));
        this._source.connect(this._node);
        this._node.connect(this._context.destination); //this should not be necessary          
    }
    micRecorder.prototype.record = function () {
        this._bIsRecording = true;
    };
    micRecorder.prototype.stop = function () {
        this._bIsRecording = false;
    };
    micRecorder.prototype.clear = function () {
        this._worker.postMessage({
            command: 'clear'
        });
    };
    micRecorder.prototype.getBuffer = function () {
        this._worker.postMessage({
            command: 'getBuffer'
        });
    };
    micRecorder.prototype.exportWAV = function (cb, type) {
        if (type === void 0) { type = 'audio/wav'; }
        this._currentCallback = cb;
        console.log(this._currentCallback);
        if (!this._currentCallback)
            throw new Error('Callback not set');
        this._worker.postMessage({
            command: 'exportWAV',
            type: type
        });
    };
    return micRecorder;
})();
//# sourceMappingURL=micRecorder.js.map