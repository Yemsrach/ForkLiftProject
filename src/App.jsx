import { useState, useEffect } from "react"
import { MqttClient } from "./services/mqtt"
import { CameraControls } from "./components/CameraControl"
import { VideoPlayer } from "./components/VideoPlayer1"
import { WebSocketVideo } from "./components/WebSocketVideo"
import "./css/App.css"

export default function App() {
  const [mqttClient, setMqttClient] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const [leftVideoUrl, setLeftVideoUrl] = useState("")
  const [rightVideoUrl, setRightVideoUrl] = useState("")
  const [fullscreenCamera, setFullscreenCamera] = useState(null)
  const [cameraStatus, setCameraStatus] = useState(null)
  const [lastControlAck, setLastControlAck] = useState("")

  useEffect(() => {
    const client = new MqttClient("ws://192.168.1.59:8083")

    client.on("connect", () => {
      console.log("Connected to MQTT broker")
      setConnectionStatus("connected")
      client.requestCameraStatus()
      client.subscribe("forklift/control"); // subscribe to receive control messages
    })

    client.on("disconnect", () => {
      console.log("Disconnected from MQTT broker")
      setConnectionStatus("disconnected")
    })



    client.on("message", (topic, message) => {
      console.log(`Received: ${topic} - ${message}`);
    });

    setMqttClient(client)
    setConnectionStatus("connecting")

    return () => {
      client.disconnect()
    }
  }, [])

  const handleCameraControl = (action, cameraId = "local_camera_right", value) => {
    if (!mqttClient) return;
    mqttClient.sendCameraControl(action, cameraId, value);
  }

  const handleFullscreen = (cameraId) => {
    setFullscreenCamera(cameraId)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-orange-400">Forklift Camera System</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Left:</span>
                <div className={`w-2 h-2 rounded-full ${leftVideoUrl ? "bg-green-500" : "bg-gray-500"}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Right:</span>
                <div className={`w-2 h-2 rounded-full ${rightVideoUrl ? "bg-green-500" : "bg-gray-500"}`}></div>
              </div>
              {cameraStatus && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Clients:</span>
                  <span className="text-green-400">{cameraStatus.system?.clients || 0}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                  }`}
              ></div>
              <span className="text-sm capitalize font-medium">{connectionStatus}</span>
            </div>
            <div className="text-sm text-gray-400 font-mono">MQTT: ws://localhost:8083</div>
            {lastControlAck && (
              <div className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                ✓ {lastControlAck.split(":")[0].split("/").pop()}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Left Camera + Controller */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-orange-400">Left Camera</h3>
                  <div className="text-xs text-gray-300 font-mono">360° View</div>
                </div>
              </div>
              <div className="aspect-video bg-black">
                {/* <VideoPlayer
                  src={leftVideoUrl || "/placeholder.svg?height=360&width=640&query=forklift left camera 360 view"}
                  title="Left Camera Feed"
                  cameraId="left"
                  isPlaceholder={!leftVideoUrl}
                  onFullscreen={handleFullscreen}
                /> */}
                <WebSocketVideo wsUrl="ws://localhost:8765" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4">
              <CameraControls
                onControl={handleCameraControl}
                disabled={connectionStatus !== "connected"}
              />
            </div>
          </div>

          {/* Right Camera + Controller */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
              <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-orange-400">Right Camera</h3>
                  <div className="text-xs text-gray-300 font-mono">360° View</div>
                </div>
              </div>
              <div className="aspect-video bg-black">
                {/* <VideoPlayer
                  src={rightVideoUrl || "/placeholder.svg?height=360&width=640&query=forklift right camera 360 view"}
                  title="Right Camera Feed"
                  cameraId="right"
                  isPlaceholder={!rightVideoUrl}
                  onFullscreen={handleFullscreen}
                /> */}
                <WebSocketVideo wsUrl="ws://localhost:8765" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4">
              <CameraControls
                onControl={handleCameraControl}
                disabled={connectionStatus !== "connected"}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
