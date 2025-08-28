import { useEffect, useRef } from "react";

export function WebSocketVideo({ wsUrl }) {
    const imgRef = useRef(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const img = imgRef.current;
        const ws = new WebSocket(wsUrl);

        let lastTime = performance.now();
        let frameCount = 0;

        ws.onmessage = (event) => {
            const now = performance.now();
            frameCount++;

            const delta = now - lastTime;
            if (delta >= 1000) {
                const fps = ((frameCount * 1000) / delta).toFixed(1);
                console.log(`📸 FPS WebSocket: ${fps}`);
                lastTime = now;
                frameCount = 0;
            }

            img.src = event.data;
        };

        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => console.warn("WebSocket closed");

        return () => {
            ws.close();
        };
    }, [wsUrl]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <img ref={imgRef} alt="Stream non disponibile" className="max-w-full max-h-full" />
        </div>
    );
}
