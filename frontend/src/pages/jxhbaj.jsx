// Just to run test Cases 
import React, { useEffect, useRef, useState } from "react";
import "../pages/styles/vedioComponent.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import io from "socket.io-client";

const server_url = "http://localhost:3000";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VedioMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVedioRef = useRef();
  let [vedioAvailable, setVedioAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [vedio, setVedio] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModel, setShowModel] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [askForUsername, setAskForUsername] = useState(true);
  let [newMessages, setNewMessages] = useState(0);
  let [username, setUsername] = useState("");
  const vedioRef = useRef([]);
  let [vedios, setVedios] = useState([]);

  const getPermissions = async () => {
    try {
      const vedioPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (vedioPermission) {
        setVedioAvailable(true);
      } else {
        setVedioAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
      if (vedioAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: vedioAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVedioRef.current) {
            localVedioRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    // Placeholder for future logic
    getPermissions();
  }, []);

  let getUserMediaSuccess = () => {};

  let getUserMedia = () => {
    if ((vedio && vedioAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ vedio: vedio, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVedioRef.current.scrObject.gettracks();
        tracks.forEach((tracks) => tracks.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (vedio !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, vedio]);

  // TODO
  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)

    if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                if (signal.sdp.type === 'offer') {
                    connections[fromId].createAnswer().then((description) => {
                        connections[fromId].setLocalDescription(description).then(() => {
                            socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                        }).catch(e => console.log(e))
                    }).catch(e => console.log(e))
                }
            }).catch(e => console.log(e))
        }

        if (signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
        }
    }
}
  // TO DO
  let addMessage = () => {};

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVedio((vedio) => vedios.filter((vedio) => vedio.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };
          connections[socketListId].onaddstream = (event) => {
            let vedioExists = vedioRef.current.find(
              (vedio) => vedio.socketId === socketListId
            );
            if (vedioExists) {
              setVedio((vedios) => {
                const updatedVedios = vedio.map((vedio) =>
                  vedio.socketId === socketListId
                    ? { ...vedio, stream: event.stream }
                    : vedio
                );
                vedioRef.current = updatedVedios;
                return updatedVedios;
              });
            } else {
              let newVedio = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };
              setVedios((vedios) => {
                const updatedVedios = [...vedios, newVedio];
                vedioRef.current = updatedVedios;
                return updatedVedios;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].onaddstream(window.localstream);
          } else {
            //TODO Blacksilence
            // let blaclsilence
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections[id2].setLocalDescription,
                    })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let getmedia = () => {
    setVedio(vedioAvailable);
    setAudio(audioAvailable);
    // connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getmedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter the Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined" // Fixed typo from "varient" to "variant"
          />
          <Button varient="contained" onClick={connect}>
            {" "}
            Connect
          </Button>

          <div>
            <video ref={localVedioRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

