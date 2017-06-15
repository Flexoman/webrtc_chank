$(document).ready(function() {

  'use strict';

  /* globals MediaRecorder */

  var mediaSource = new MediaSource();
      mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
  var mediaRecorder;
  var recordedBlobs;
  var sourceBuffer;

  var recordedVideo = document.getElementById('remote2Video');
  var recordButton = document.getElementById('recordButton');
  var playButton = document.getElementById('playButton');
  var downloadButton = document.getElementById('downloadButton');
  recordButton.onclick = toggleRecording;
  playButton.onclick = play;
  downloadButton.onclick = download;

  // window.isSecureContext could be used for Chrome
  var isSecureOrigin = location.protocol === 'https:' ||
  location.hostname === 'localhost';
  if (!isSecureOrigin) {
    alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
      '\n\nChanging protocol to HTTPS');
    location.protocol = 'HTTPS';
  }


  function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  function handleSourceOpen(event) {
    console.log('MediaSource opened');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', sourceBuffer);
  }

  recordedVideo.addEventListener('error', function(ev) {
    console.error('MediaRecording.recordedMedia.error()');
    alert('Your browser can not play\n\n' + recordedVideo.src
      + '\n\n media clip. event: ' + JSON.stringify(ev));
  }, true);

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

  function handleStop(event) {
    console.log('Recorder stopped: ', event);
  }

  function toggleRecording() {
    if (recordButton.textContent === 'Start Recording') {
      startRecording();
    } else {
      stopRecording();
      recordButton.textContent = 'Start Recording';
      playButton.disabled = false;
      downloadButton.disabled = false;
    }
  }

  function startRecording() {
    recordedBlobs = [];
    var options = {mimeType: 'video/webm;codecs=vp9'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm;codecs=vp8'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: 'video/webm'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.log(options.mimeType + ' is not Supported');
          options = {mimeType: ''};
        }
      }
    }
    try {
      if (!localSteem)
        return console.error('localSteem not found');
      mediaRecorder = new MediaRecorder(localSteem, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      alert('Exception while creating MediaRecorder: '
        + e + '. mimeType: ' + options.mimeType);
      return;
    }
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
  }

  function stopRecording() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
    recordedVideo.controls = true;
  }

  function play() {
    // var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});

  var video = recordedVideo
  var mediaSource = new MediaSource;
  video.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', sourceOpen)

  var file = new File("http://localhost:3000/source/test.mp4");
  debugger
  function sourceOpen () {
    var mediaSource = this;
    var sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    sourceBuffer.addEventListener('updateend', function () {
      mediaSource.endOfStream();
      video.play();
    });
    sourceBuffer.appendBuffer(buf); // buf is the arraybuffer to store the video data
  };


    // recordedVideo.src = window.URL.createObjectURL(superBuffer);
  }

  function download() {
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }


})