/**
 * Created by DAW-821760408-sp on 11/22/16.
 */

module.exports = initViewer

const kurentoUtils = require('kurento-utils')

function initViewer(socket, remoteVideo) {
	let webRtcPeer = null

	viewer()

	socket.on('message', (message) => {  // websocket to communicate with socket server
		let parsedMessage = JSON.parse(message)
		console.info(`Received message: ${message}`)

		switch (parsedMessage.id) {
			case 'presenterResponse':
				presenterResponse(parsedMessage)
				break
			case 'viewerResponse':
				viewerResponse(parsedMessage)
				break
			case 'stopCommunication':
				dispose()
				break
			case 'iceCandidate':
				webRtcPeer.addIceCandidate(parsedMessage.candidate)
				break
			default:
				console.error('Unrecognized message', parsedMessage)
		}
	})

	function presenterResponse(message) {
		if (message.response !== 'accepted') {
			let errorMsg = message.message ? message.message : 'Unknow error'
			console.warn(`Call not accepted for the following reason: ${errorMsg}`)
			dispose()
		} else {
			webRtcPeer.processAnswer(message.sdpAnswer)
		}
	}

	function viewerResponse(message) {
		presenterResponse(message)
	}

	function viewer() {
		if (!webRtcPeer) {

			let options = {
				remoteVideo: remoteVideo,
				onicecandidate : onIceCandidate
			}

			webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
				if (error) return onError(error)

				this.generateOffer(onOfferViewer)
			})
		}
	}

	function onOfferViewer(error, offerSdp) {
		if (error) return onError(error)

		let message = {
			id : 'viewer',
			sdpOffer : offerSdp
		}
		sendMessage(message)
	}

	function onIceCandidate(candidate) {
		console.log(`Local candidate ${JSON.stringify(candidate)}`)

		let message = {
			id : 'onIceCandidate',
			candidate : candidate
		}
		sendMessage(message)
	}

	function stop() {
		if (webRtcPeer) {
			var message = {
				id : 'stop'
			}
			sendMessage(message)
			dispose()
		}
	}

	function dispose() {
		if (webRtcPeer) {
			webRtcPeer.dispose()
			webRtcPeer = null
		}
	}

	function sendMessage(message) {
		let jsonMessage = JSON.stringify(message)
		console.log(`Senging message: ${jsonMessage}`)
		socket.send(jsonMessage)
	}
}
