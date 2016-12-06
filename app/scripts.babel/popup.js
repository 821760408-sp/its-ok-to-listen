'use strict';

const MediaStreamRecorder = require('msr')
const socket = io('https://localhost:3000')

window.addEventListener('DOMContentLoaded', function DOMContentLoaded() {
  window.removeEventListener('DOMContentLoaded', DOMContentLoaded)

  // window.AudioContext = window.AudioContext || window.webkitAudioContext
  // const audioContext = new AudioContext()
  // const mediaStreamSource = audioContext.createMediaStreamSource( stream )

  ////////////////////////////////////////////////////////////
  const remoteVideo = document.getElementById('remote-video')
  const remoteAudio = document.getElementById('remote-audio')

  ////////////////////////////////////////////////////////////
  //TODO: run in a web worker?
  const initViewer = require('./initViewer')
  initViewer(socket, remoteAudio)

  ////////////////////////////////////////////////////////////
  document.querySelector('#start-recording').onclick = function() {
    this.disabled = true

    const mediaRecorder = new MediaStreamRecorder(window.stream)
    mediaRecorder.stream = window.stream

    // force WebAudio API on all browsers
    // it allows you record remote audio-streams in Firefox also in Microsoft Edge
    mediaRecorder.mimeType = 'audio/wav'

    mediaRecorder.ondataavailable = function (blob) {
      // POST/PUT "Blob" using FormData/XHR2
      const blobURL = URL.createObjectURL(blob)
      // document.write('<a href="' + blobURL + '">' + blobURL + '</a>')
      const a = document.createElement('a')
      a.target = '_blank'
      a.innerHTML = 'Open Recorded Audio No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval)
      a.href = blobURL
      document.body.appendChild(a)
    }
    const timeInterval = 10000
    mediaRecorder.start(timeInterval)

    document.querySelector('#stop-recording').disabled = false
    document.querySelector('#save-recording').disabled = false
  }

  document.querySelector('#stop-recording').onclick = function() {
    this.disabled = true
    mediaRecorder.stop()
    mediaRecorder.stream.stop()
    document.querySelector('#start-recording').disabled = false
  }

  document.querySelector('#save-recording').onclick = function() {
    this.disabled = true
    mediaRecorder.save()
  }

  let index = 1
  // below function via: http://goo.gl/B3ae8c
  function bytesToSize(bytes) {
    const k = 1000
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10)
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  }
  // below function via: http://goo.gl/6QNDcI
  function getTimeLength(milliseconds) {
    const data = new Date(milliseconds)
    return data.getUTCHours() + ' hours, ' + data.getUTCMinutes() + ' minutes and ' + data.getUTCSeconds() + ' second(s)'
  }

  ////////////////////////////////////////////////////////////
  // Code from here: http://stackoverflow.com/questions/9270782/how-to-alter-title-of-present-tab-using-chrome-extension
  chrome.tabs.query({
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
  }, (tab) => {
    console.log(tab[0])
    socket.on('speech', (data) => {
      if (data.results) {
        data.results.replace(/('|")/g, (match) => { return '\\' + match })
        console.log(`\n${data.results}\n`)
        chrome.tabs.executeScript(tab[0].id, {
          code:
            `
            var title = '${data.results}   ';
            console.log(title);
            (function scrollTitle() {
              title = title.substring(1, title.length) + title.substring(0, 1);
              document.title = title;
              setTimeout(scrollTitle, 300);
            })()
            `
        })
      }
    })
  })

  ////////////////////////////////////////////////////////////
  window.onbeforeunload = function() {
    document.querySelector('#start-recording').disabled = false
  }
})
