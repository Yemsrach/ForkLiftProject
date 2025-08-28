# video_ws_server.py
import asyncio
import base64
import argparse
import cv2
import websockets
from websockets.server import serve
import json
import threading
import paho.mqtt.client as mqtt

# global control state
CONTROL_STATE = {
    "zoom": 1.0,   # 1.0 = original size
    "pan": 0,      # pixels
    "tilt": 0      # pixels
}

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code", rc)
    print("Subscribing to topic forklift/control…")  # <-- Add this line
    client.subscribe("forklift/control")

def on_message(client, userdata, msg):
    print("MQTT message received!") 
    try:
        payload = json.loads(msg.payload.decode())
        command = payload.get("command")
        camera_id = payload.get("id")
        value = payload.get("value")
        print("Received payload:", payload)

        # Only act if the message is for this camera
        if camera_id != "local_camera_right":
            return
        # Update CONTROL_STATE
        if command == "zoom_in":
            CONTROL_STATE["zoom"] = max(0.5, min(3.0, value / 50))
        elif command == "zoom_out":
            CONTROL_STATE["zoom"] = max(0.5, min(3.0, value / 50))
        elif command == "pan_left":
            CONTROL_STATE["pan"] -= 20
        elif command == "pan_right":
            CONTROL_STATE["pan"] += 20
        elif command == "tilt_up":
            CONTROL_STATE["tilt"] -= value
        elif command == "tilt_down":
            CONTROL_STATE["tilt"] += value
        # roll_left / roll_right can be implemented similarly if needed
        print("Updated control state:", CONTROL_STATE)
    except Exception as e:
        print("Failed to process MQTT message:", e)

def start_mqtt():
    client = mqtt.Client(transport="websockets")
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect("192.168.1.59", 8083, 60)
    

    print("MQTT client starting loop…")  # <-- Add this line
    client.loop_start()  # non-blocking loop
    print("MQTT client loop started")    # <-- Add this line

mqtt_thread = threading.Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

# def frame_to_data_url(frame, quality=80, max_width=None):
#     if max_width and frame.shape[1] > max_width:
#         h, w = frame.shape[:2]
#         new_h = int(h * (max_width / w))
#         frame = cv2.resize(frame, (max_width, new_h))

#     encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
#     ok, buf = cv2.imencode(".jpg", frame, encode_param)
#     if not ok:
#         return None
#     b64 = base64.b64encode(buf).decode("utf-8")
#     return "data:image/jpeg;base64," + b64

def frame_to_data_url(frame, quality=80, max_width=None):
    # Apply zoom and pan/tilt
    zoom = CONTROL_STATE["zoom"]
    pan = CONTROL_STATE["pan"]
    tilt = CONTROL_STATE["tilt"]

    h, w = frame.shape[:2]

    # Zoom
    center_x, center_y = w // 2, h // 2
    new_w = int(w / zoom)
    new_h = int(h / zoom)
    x1 = max(center_x - new_w // 2 + pan, 0)
    y1 = max(center_y - new_h // 2 + tilt, 0)
    x2 = min(x1 + new_w, w)
    y2 = min(y1 + new_h, h)
    frame = frame[y1:y2, x1:x2]

    # Resize to max_width
    if max_width and frame.shape[1] > max_width:
        h, w = frame.shape[:2]
        new_h = int(h * (max_width / w))
        frame = cv2.resize(frame, (max_width, new_h))

    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    ok, buf = cv2.imencode(".jpg", frame, encode_param)
    if not ok:
        return None
    b64 = base64.b64encode(buf).decode("utf-8")
    return "data:image/jpeg;base64," + b64

async def stream_from_capture(websocket, cap, fps, quality, max_width):
    delay = 1.0 / float(fps)
    last = asyncio.get_event_loop().time()
    while True:
        ok, frame = cap.read()
        if not ok:
            # If video file ended, loop it
            if cap.get(cv2.CAP_PROP_FRAME_COUNT) > 0:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                break

        data_url = frame_to_data_url(frame, quality=quality, max_width=max_width)
        if data_url:
            await websocket.send(data_url)

        # pace the stream
        now = asyncio.get_event_loop().time()
        sleep_for = max(0, delay - (now - last))
        await asyncio.sleep(sleep_for)
        last = now

async def handler(websocket):
    # one stream per client (simple and fine for local testing)
    source = ARGS.camera if ARGS.camera is not None else ARGS.video
    if ARGS.camera is not None:
        cap = cv2.VideoCapture(int(ARGS.camera), cv2.CAP_DSHOW)  # CAP_DSHOW helps on Windows webcams
    else:
        cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        await websocket.send("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiB2aWV3Qm94PSIwIDAgNjQwIDM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgZmlsbD0iI0IyQjJCMiIvPjx0ZXh0IHg9IjMyMCIgeT0iMTgwIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb3VyY2Ugbm90IG9wZW5lZDwvdGV4dD48L3N2Zz4=")
        await websocket.close(code=1011, reason="Video source not opened")
        return

    try:
        await stream_from_capture(websocket, cap, fps=ARGS.fps, quality=ARGS.quality, max_width=ARGS.max_width)
    except websockets.ConnectionClosedOK:
        pass
    except websockets.ConnectionClosedError:
        pass
    finally:
        cap.release()

async def main():
    async with serve(handler, ARGS.host, ARGS.port, max_size=None):  # allow large frames
        print(f"WebSocket video server on ws://{ARGS.host}:{ARGS.port}")
        if ARGS.camera is not None:
            print(f"Streaming from webcam index {ARGS.camera}")
        else:
            print(f"Streaming file: {ARGS.video}")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WebSocket MJPEG-like video streamer")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--quality", type=int, default=80, help="JPEG quality 1-100")
    parser.add_argument("--max-width", type=int, default=1280, help="Downscale width for performance (px)")
    # choose one: file OR webcam
    parser.add_argument("--video", default="sample360.mp4", help="Path to mp4 file")
    parser.add_argument("--camera", type=int, help="Webcam index, e.g. 0 to use your default camera")
    ARGS = parser.parse_args()

    asyncio.run(main())
