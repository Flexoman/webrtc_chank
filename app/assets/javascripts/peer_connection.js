$(document).ready(function() {


  var selfView = document.getElementById('localVideo');
  var remoteView = document.getElementById('remoteVideo');
  var startButton = document.getElementById('startButton');

  var socket = App.cable.subscriptions.create({ channel: "WebrtcSignalServer", channel_id: "010101010" },{
      connected: function() {
        console.log('connected')
      },
      disconnected: function() {
        console.log('disconnected')
      },
      received: function(data) {
        console.log(data)
        onmessage(data)
      },
      speak: function(data = {}) {
        return this.perform('speak', data );
      }
  })
    var ICE_config = {
      'iceServers': [
        {
          'urls': 'stun:stun.l.google.com:19302'
        },
        {
          'urls': 'turn:192.158.29.39:3478?transport=udp',
          'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          'username': '28224511:1379330808'
        },
        {
          'urls': 'turn:192.158.29.39:3478?transport=tcp',
          'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          'username': '28224511:1379330808'
        }
      ]
    }

  // var configuration = { "iceServers": [{ "urls": "stun:stun.example.org" }] };
  var pc;

  // call start() to initiate

  function start() {
      pc = new RTCPeerConnection(ICE_config);

      // send any ice candidates to the other peer
      pc.onicecandidate = function (evt) {
          socket.speak({ "candidate": evt.candidate })
      };

      // let the "negotiationneeded" event trigger offer generation
      pc.onnegotiationneeded = function () {
          pc.createOffer().then(function (offer) {
              return pc.setLocalDescription(offer);
          })
          .then(function () {
              // send the offer to the other peer
              socket.speak({ "desc": pc.localDescription })
          })
          .catch(logError);
      };

      // once remote track arrives, show it in the remote video element
      pc.ontrack = function (evt) {
          // don't set srcObject again if it is already set.
          if (!remoteView.srcObject)
            remoteView.srcObject = evt.streams[0];
      };

      // get a local stream, show it in a self-view and add it to be sent
      navigator.mediaDevices.getUserMedia({ "audio": true, "video": true })
          .then(function (stream) {
              selfView.srcObject = stream;
              pc.addTrack(stream.getAudioTracks()[0], stream);
              pc.addTrack(stream.getVideoTracks()[0], stream);
          })
          .catch(logError);
  }

  startButton.onclick = function(){
    start()
  }

  startButton.onclick = start
  function onmessage(evt) {
      if (!pc) start();

      var message = evt// JSON.parse(evt.data);
      if (message.desc) {

          var desc = message.desc;

          // if we get an offer, we need to reply with an answer
          if (desc.type == "offer") {
              pc.setRemoteDescription(desc).then(function () {
                  return pc.createAnswer();
              })
              .then(function (answer) {
                  return pc.setLocalDescription(answer);
              })
              .then(function () {
                  socket.speak({ "desc": pc.localDescription })
              })
              .catch(logError);
          } else if (desc.type == "answer") {
              pc.setRemoteDescription(desc).catch(logError);
          } else {
              console.log("Unsupported SDP type. Your code may differ here.");
          }
      } else
          pc.addIceCandidate(message.candidate).catch(logError);
  };

  function logError(error) {
      // console.log(error.name + ": " + error.message);
      console.error(error);
  }


});