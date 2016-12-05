'use strict';

window.addEventListener('DOMContentLoaded', function DOMContentLoaded() {
  window.removeEventListener('DOMContentLoaded', DOMContentLoaded)

  const socket = io('https://localhost:3000')

  const _video = document.getElementById('remote-video')
  const remoteVideo = (_video instanceof Array) ? _video[0] : _video

  //TODO: run in a web worker?
  const initViewer = require('./initViewer')
  initViewer(socket, remoteVideo)

  /* Get transcription from remote speech */
  let _divSpeechText = document.getElementById('speech-transcript')
  socket.on('speech', (data) => {
    if (data.results) _divSpeechText.innerHTML += `${data.results} `
  })
})