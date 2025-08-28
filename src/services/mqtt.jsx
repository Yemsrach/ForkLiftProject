// import mqtt from "mqtt";

// export class MqttClient {
//     constructor(url) {
//         this.ws = null
//         this.url = url
//         this.listeners = {}
//         this.reconnectAttempts = 0
//         this.maxReconnectAttempts = 5
//         this.reconnectDelay = 3000
//         this.isConnected = false
//         this.messageQueue = []

//         this.connect()
//     }

//     connect() {
//         try {
//             this.ws = new WebSocket(this.url)

//             this.ws.onopen = () => {
//                 console.log("MQTT WebSocket connected")
//                 this.isConnected = true
//                 this.reconnectAttempts = 0
//                 this.emit("connect")

//                 // Subscribe to camera feeds and control acknowledgments
//                 this.subscribe("forklift/control")
//                 // this.subscribe("forklift/camera/right")
//                 // this.subscribe("forklift/control/+/ack")
//                 // this.subscribe("forklift/status/+")

//                 // Send any queued messages
//                 this.flushMessageQueue()
//             }

//             this.ws.onmessage = (event) => {
//                 try {
//                     const data = JSON.parse(event.data)
//                     this.handleMessage(data.topic, data.payload)
//                 } catch (e) {
//                     // Handle plain text messages
//                     const parts = event.data.split(":", 2)
//                     if (parts.length === 2) {
//                         this.handleMessage(parts[0], parts[1])
//                     }
//                 }
//             }

//             this.ws.onclose = () => {
//                 console.log("MQTT WebSocket disconnected")
//                 this.isConnected = false
//                 this.emit("disconnect")
//                 this.attemptReconnect()
//             }

//             this.ws.onerror = (error) => {
//                 console.error("MQTT WebSocket error:", error)
//                 this.isConnected = false
//                 this.emit("error", error)
//             }
//         } catch (error) {
//             console.error("Failed to connect to MQTT broker:", error)
//             this.attemptReconnect()
//         }
//     }

//     handleMessage(topic, payload) {
//         console.log(`Received: ${topic} - ${payload}`)

//         if (topic.includes("/ack")) {
//             this.emit("controlAck", topic, payload)
//         }

//         if (topic.includes("/status/")) {
//             this.emit("statusUpdate", topic, payload)
//         }

//         this.emit("message", topic, payload)
//     }

//     attemptReconnect() {
//         if (this.reconnectAttempts < this.maxReconnectAttempts) {
//             this.reconnectAttempts++
//             console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

//             setTimeout(() => {
//                 this.connect()
//             }, this.reconnectDelay)
//         } else {
//             console.error("Max reconnection attempts reached")
//             this.emit("maxReconnectReached")
//         }
//     }

//     publish(topic, payload) {
//         const message = { topic, payload }

//         if (this.ws && this.ws.readyState === WebSocket.OPEN && this.isConnected) {
//             this.sendMessage(message)
//         } else {
//             this.messageQueue.push(message)
//             console.warn("MQTT client not connected, message queued:", topic)
//         }
//     }

//     sendMessage(message) {
//         if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//             const jsonMessage = JSON.stringify(message)
//             this.ws.send(jsonMessage)
//             console.log(`Sent: ${message.topic} - ${message.payload}`)
//         }
//     }

//     flushMessageQueue() {
//         while (this.messageQueue.length > 0) {
//             const message = this.messageQueue.shift()
//             if (message) {
//                 this.sendMessage(message)
//             }
//         }
//     }

//     sendCameraControl(action, cameraId, value) {
//         const topic = "forklift/control";
//         const payload = JSON.stringify({
//             id: cameraId,
//             command: action,
//             value: value
//         });
//         this.publish(topic, payload);
//     }

//     requestCameraStatus() {
//         this.publish("forklift/control/status/request", "all")
//     }

//     setCameraPreset(preset) {
//         this.publish("forklift/control/preset", preset)
//     }

//     subscribe(topic) {
//         if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//             const message = JSON.stringify({ action: "subscribe", topic })
//             this.ws.send(message)
//             console.log(`Subscribed to: ${topic}`)
//         }
//     }

//     unsubscribe(topic) {
//         if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//             const message = JSON.stringify({ action: "unsubscribe", topic })
//             this.ws.send(message)
//             console.log(`Unsubscribed from: ${topic}`)
//         }
//     }

//     on(event, callback) {
//         if (!this.listeners[event]) {
//             this.listeners[event] = []
//         }
//         this.listeners[event].push(callback)
//     }

//     off(event, callback) {
//         if (this.listeners[event]) {
//             this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
//         }
//     }

//     emit(event, ...args) {
//         if (this.listeners[event]) {
//             this.listeners[event].forEach((callback) => callback(...args))
//         }
//     }

//     getConnectionStatus() {
//         if (this.isConnected) return "connected"
//         if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return "connecting"
//         return "disconnected"
//     }

//     disconnect() {
//         if (this.ws) {
//             this.isConnected = false
//             this.ws.close()
//             this.ws = null
//         }
//     }
// }
// services/mqtt.js
import mqtt from "mqtt";

export class MqttClient {
    constructor(url) {
        this.client = mqtt.connect(url); // ws://192.168.1.59:8083

        this.listeners = {};

        this.client.on("connect", () => {
            console.log("MQTT connected");
            this.emit("connect");
        });

        this.client.on("reconnect", () => {
            console.log("MQTT reconnecting...");
        });

        this.client.on("close", () => {
            console.log("MQTT disconnected");
            this.emit("disconnect");
        });

        this.client.on("error", (err) => {
            console.error("MQTT error:", err);
        });

        this.client.on("message", (topic, message) => {
            const payload = message.toString();
            console.log(`Received MQTT message: ${topic} - ${payload}`);
            this.emit("message", topic, payload);

            if (topic.includes("/ack")) this.emit("controlAck", topic, payload);
            if (topic.includes("/status/")) this.emit("statusUpdate", topic, payload);
        });
    }

    subscribe(topic) {
        this.client.subscribe(topic, (err) => {
            if (err) console.error("Subscribe error:", err);
            else console.log(`Subscribed to: ${topic}`);
        });
    }

    publish(topic, payload) {
        this.client.publish(topic, payload, (err) => {
            if (err) console.error("Publish error:", err);
            else console.log(`Published: ${topic} - ${payload}`);
        });
    }

    sendCameraControl(action, cameraId, value) {
        const payload = JSON.stringify({ id: cameraId, command: action, value });
        this.publish("forklift/control", payload);
    }

    requestCameraStatus() {
        this.publish("forklift/control/status/request", "all");
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((cb) => cb(...args));
        }
    }

    disconnect() {
        this.client.end();
    }
}
