// window.onload = function () {
  var canvas,
      video,
      button,
      context,
      sub,
      video2,
      videoStreamUrl;

$(document).ready(function () {
  canvas = document.getElementById('canvas');
  video = document.getElementById('video');
  button = document.getElementById('button');
  video2 = document.getElementById('imageee');
  context = canvas.getContext('2d');
  videoStreamUrl = false;

  button.addEventListener('click', captureMe);
  connect();
});

  // функция которая будет выполнена при нажатии на кнопку захвата кадра
var captureMe = function () {
  if (!videoStreamUrl) alert('То-ли вы не нажали "разрешить" в верху окна, то-ли что-то не так с вашим видео стримом')
  // переворачиваем canvas зеркально по горизонтали (см. описание внизу статьи)
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  // отрисовываем на канвасе текущий кадр видео
  context.drawImage(video, 0, 0, video.width, video.height);
  // получаем data: url изображения c canvas
  var base64dataUrl = canvas.toDataURL('image/jpg');
  context.setTransform(1, 0, 0, 1, 0, 0); // убираем все кастомные трансформации canvas

  // на этом этапе можно спокойно отправить  base64dataUrl на сервер и сохранить его там как файл (ну или типа того)
  sub.sending({img: base64dataUrl})

  setTimeout(function(){
    captureMe()
  },100)
}

// navigator.getUserMedia  и   window.URL.createObjectURL (смутные времена браузерных противоречий 2012)

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL;

// запрашиваем разрешение на доступ к поточному видео камеры
navigator.getUserMedia({video: true}, function (stream) {
  // получаем url поточного видео
  videoStreamUrl = window.URL.createObjectURL(stream);
  // устанавливаем как источник для video
  video.src = videoStreamUrl;
  }, function () {
  console.log('что-то не так с видеостримом или пользователь запретил его использовать :P');
})


function connect(){
  sub = App.cable.subscriptions.create({ channel: "DataChannel" },{
      connected: function() {
        toastr.info('connect to DataChannel' )
      },
      disconnected: function() {
      },
      received: function(data) {
        // console.log(data)
        onresive(data)
      },
      sending: function(data = {}) {
        return this.perform('sending', data);
      }
  })

}

function onresive(data){
  var s_base64dataUrl = data.img
  // но мы добавим эти тестовые снимки в наш пример:
  video2.src = s_base64dataUrl;
}


if (false) {
  var stream = new WebSocket('ws://localhost:9393')
  var videoElement = document.querySelector("#desktop")
  var videoSource = document.querySelector("source")
  window.MediaSource = window.MediaSource || window.WebKitMediaSource;
  var mediaSource = new MediaSource()
  videoElement.src = window.URL.createObjectURL(mediaSource)

  stream.onopen = function(){
    console.log('connection open')
  }

  stream.onclose = function(){
    console.log('connection closed')
  }

  mediaSource.addEventListener('sourceopen', function(e){
    var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"')

    stream.onmessage = function(e){
      var byteCharacters = atob(e.data)

      var byteNumbers = new Array(byteCharacters.length)
      for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }

      var byteArray = new Uint8Array(byteNumbers)

      sourceBuffer.appendStream(byteArray)

    }

  }, false)
}