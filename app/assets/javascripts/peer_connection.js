'use strict';

var selfView,
    remoteView;

var callButton,
    connectButton,
    disconnectButton;

var SignalServer,
    localSteem;

var connect_counter = 0;

$(document).ready(function() {
    selfView = document.getElementById('localVideo');
    remoteView = document.getElementById('remoteVideo');
    callButton = document.getElementById('callButton');
    connectButton = document.getElementById('connectButton');
    disconnectButton = document.getElementById('disconnectButton');

    callButton.onclick = function(){ start() }
    connectButton.onclick = function(){ connect() }
})

function connect(){
  var channel_id = document.getElementById('channel_val').value;

  SignalServer = App.cable.subscriptions.create({ channel: "WebrtcSignalServer", channel_id: channel_id },{
      connected: function() {
        toastr.info('connect to channel: ' + channel_id)
        open_local_steem()
        callButton.disabled = false
      },
      disconnected: function() {
        toastr.info('disconnected from channel: ' + channel_id)
      },
      received: function(data) {
        console.log(data)
        onmessage(data)
      },
      signal: function(data = {}) {
        return this.perform('signal', data );
      }
  })

}

function open_local_steem() {
  // get a local stream, show it in a self-view and add it to be sent
  navigator.mediaDevices
           .getUserMedia({ "audio": true, "video": true })
           .then(function (stream) {
              selfView.srcObject = stream;
              localSteem = stream;
           }).catch(logError);
}

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

function start() {
    pc = new RTCPeerConnection(ICE_config);

    // send any ice candidates to the other peer
    pc.onicecandidate = function (evt) {
        SignalServer.signal({ "candidate": evt.candidate })
    };

    // let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = function () {
        pc.createOffer()
          .then(function (offer) {
            return pc.setLocalDescription(offer); })
          .then(function () {
            // send the offer to the other peer
            SignalServer.signal({ "desc": pc.localDescription }) })
          .catch(logError);
    };

    // once remote track arrives, show it in the remote video element
    pc.ontrack = function (evt) {
        // don't set srcObject again if it is already set.
        if (!remoteView.srcObject)
          remoteView.srcObject = evt.streams[0];
        console.log(evt.streams)
    };


  if (localSteem)
    pc.addTrack(localSteem.getAudioTracks()[0], localSteem);
    pc.addTrack(localSteem.getVideoTracks()[0], localSteem);
}


function onmessage(data) {
  // debugger
    if (!pc) {
      callButton.disabled = true
      start();
    }
    if (data.desc) {
        var desc = data.desc;

        // if we get an offer, we need to reply with an answer
        if (desc.type == "offer") {
           connect_counter += 1
           console.log('connect_counter', connect_counter)

            pc.setRemoteDescription(desc)
              .then(function () {
                return pc.createAnswer();
              })
              .then(function (answer) {
                  return pc.setLocalDescription(answer);
              })
              .then(function () {
                  SignalServer.signal({ "desc": pc.localDescription })
              })
              .catch(logError);

        } else if (desc.type == "answer") {
            pc.setRemoteDescription(desc)
              .catch(logError);
        } else {
            console.log("Unsupported SDP type. Your code may differ here.");
        }
    } else{
            pc.addIceCandidate(data.candidate)
              .catch(logError);
    }
};

function logError(error) {
    console.error(error.name + ": " + error.message);
    // console.error(error);
    toastr.error(error.name + ": " + error.message)
    // console.error(error);
}