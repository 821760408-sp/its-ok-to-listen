'use strict';

window.addEventListener('DOMContentLoaded', () => {

  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, (stream) => {
      console.log(stream);
    }, (error) => {
      console.error(error);
    });
  }
});

console.log('\'Allo \'Allo! Popup');
