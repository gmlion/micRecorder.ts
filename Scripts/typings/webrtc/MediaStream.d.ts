﻿// Type definitions take from http://dev.w3.org/2011/webrtc/editor/getusermedia.html

interface MediaStreamConstraints {
    audio: boolean;
    video: boolean;
}
declare var MediaStreamConstraints: {
    prototype: MediaStreamConstraints;
    new (): MediaStreamConstraints;
}

interface MediaTrackConstraints {
    mandatory: MediaTrackConstraintSet;
    optional: MediaTrackConstraint[];
}
declare var MediaTrackConstraints: {
    prototype: MediaTrackConstraints;
    new (): MediaTrackConstraints;
}

// ks - Not defined in the source doc.
interface MediaTrackConstraintSet {
}
declare var MediaTrackConstraintSet: {
    prototype: MediaTrackConstraintSet;
    new (): MediaTrackConstraintSet;
}

// ks - Not defined in the source doc.
interface MediaTrackConstraint {
}
declare var MediaTrackConstraint: {
    prototype: MediaTrackConstraint;
    new (): MediaTrackConstraints;
}

interface Navigator {
    getUserMedia(constraints: MediaStreamConstraints, successCallback: (stream: LocalMediaStream) => void , errorCallback: (error: Error) => void );
    webkitGetUserMedia(constraints: MediaStreamConstraints, successCallback: (stream: LocalMediaStream) => void , errorCallback: (error: Error) => void );
}

interface EventHandler { (event: Event): void; }

interface NavigatorUserMediaSuccessCallback { (stream: LocalMediaStream): void; }

interface NavigatorUserMediaError {
    PERMISSION_DENIED: number; // = 1;
    code: number;
}
declare var NavigatorUserMediaError: {
    prototype: NavigatorUserMediaError;
    new (): NavigatorUserMediaError;
    PERMISSION_DENIED: number; // = 1;
}

interface NavigatorUserMediaErrorCallback { (error: NavigatorUserMediaError): void; }

interface MediaStreamTrackList {
    length: number;
    item: MediaStreamTrack;
    add(track: MediaStreamTrack): void;
    remove(track: MediaStreamTrack): void;
    onaddtrack: (event: Event) => void;
    onremovetrack: (event: Event) => void;
}
declare var MediaStreamTrackList: {
    prototype: MediaStreamTrackList;
    new (): MediaStreamTrackList;
}
declare var webkitMediaStreamTrackList: {
    prototype: MediaStreamTrackList;
    new (): MediaStreamTrackList;
}

interface MediaStream {
    label: string;
    audioTracks: MediaStreamTrackList;
    videoTracks: MediaStreamTrackList;
    ended: boolean;
    onended: (event: Event) => void;
}
declare var MediaStream: {
    prototype: MediaStream;
    new (): MediaStream;
    new (trackContainers: MediaStream[]): MediaStream;
    new (trackContainers: MediaStreamTrackList[]): MediaStream;
    new (trackContainers: MediaStreamTrack[]): MediaStream;
}
declare var webkitMediaStream: {
    prototype: MediaStream;
    new (): MediaStream;
    new (trackContainers: MediaStream[]): MediaStream;
    new (trackContainers: MediaStreamTrackList[]): MediaStream;
    new (trackContainers: MediaStreamTrack[]): MediaStream;
}

interface LocalMediaStream extends MediaStream {
    stop(): void;
}

interface MediaStreamTrack {
    kind: string;
    label: string;
    enabled: boolean;
    LIVE: number; // = 0;
    MUTED: number; // = 1;
    ENDED: number; // = 2;
    readyState: number;
    onmute: (event: Event) => void;
    onunmute: (event: Event) => void;
    onended: (event: Event) => void;
}
declare var MediaStramTrack: {
    prototype: MediaStreamTrack;
    new (): MediaStreamTrack;
    LIVE: number; // = 0;
    MUTED: number; // = 1;
    ENDED: number; // = 2;
}

interface URL {
    createObjectURL(stream: MediaStream): string;
}


interface WebkitURL extends URL {
}
declare var webkitURL: {
    prototype: WebkitURL;
    new (): URL;
    createObjectURL(stream: MediaStream): string;
}
