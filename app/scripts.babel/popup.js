'use strict';

const socket = io('https://localhost:3000');
console.dir(socket);

window.addEventListener('DOMContentLoaded', function DOMContentLoaded() {
  window.removeEventListener('DOMContentLoaded', DOMContentLoaded);
  const _video = document.getElementById('remote-video');
  const remoteVideo = (_video instanceof Array) ? _video[0] : _video;
  const initViewer = require('./initViewer');
  const constraints = {
    audio: true,
    video: true
  };
  let videoStream = null;
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream) => {
        videoStream = mediaStream;
        console.log(videoStream);
        initViewer(socket, remoteVideo)
      })
      .catch((err) => {
        console.log(err)
      })
  }
});