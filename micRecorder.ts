/// <reference path="scripts/typings/webaudioapi/waa.d.ts" />
/*Reference recorder.js https://github.com/mattdiamond/Recorderjs*/

class micRecorder {
    constructor(private _source: AudioNode, private _config: { bufferLength: number; numberOfChannels: number; workerPath: string } = {
        bufferLength: 4096,
        numberOfChannels: 1,
        workerPath: 'micRecorderWorker.js'
    })
    {
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
        this._node.addEventListener('audioprocess', function (event: AudioProcessingEvent) {
            (function (bIsRecording: boolean, numberOfChannels: number, event: AudioProcessingEvent, worker: Worker) {
                if (!bIsRecording) {
                    return;
                }
                var buffer = new Array<any>();
                for (var channel = 0; channel < numberOfChannels; channel++) {
                    buffer.push(event.inputBuffer.getChannelData(channel));
                }
                worker.postMessage({
                    command: 'record',
                    buffer: buffer
                });
            })(this._bIsRecording, /*this._config.numberOfChannels*/1, event, this._worker);
        }.bind(this));
        this._worker.addEventListener('message', function (event: any) {
            (function (event: any, currentCallback: (data: any) => void) {
                var blob = event.data;
                console.log(blob);
                //console.log(currentCallback);
                currentCallback(blob);
            })(event, this._currentCallback);
        }.bind(this));
        this._source.connect(this._node);
        this._node.connect(this._context.destination); //this should not be necessary          
    }

    record(): void {
        this._bIsRecording = true;    
    }

    stop(): void {
        this._bIsRecording = false;
    }

    clear(): void {
        this._worker.postMessage({
            command: 'clear'
        });
    }

    getBuffer(): void {
        this._worker.postMessage({
            command: 'getBuffer'
        });
    }

    exportWAV(cb, type = 'audio/wav'): void {
        
        this._currentCallback = cb;
        console.log(this._currentCallback);
        if (!this._currentCallback) throw new Error('Callback not set');
        this._worker.postMessage({
            command: 'exportWAV',
            type: type
        });
        
    }

    private _context: AudioContext;
    private _node: ScriptProcessorNode;
    private _worker: Worker;
    private _bIsRecording: boolean;
    private _currentCallback: (data: any) => void;
    
}