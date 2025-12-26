import asyncio
import websockets
import sys

async def test_terminal():
    uri = "ws://localhost:8000/api/terminal/ws"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            
            # Send a command
            await websocket.send("echo Hello\r")
            
            # Read response
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    print(f"Received: {repr(response)}")
                    if "Hello" in response:
                        print("SUCCESS: Received echoed text")
                        break
            except asyncio.TimeoutError:
                print("Timeout waiting for response")

    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_terminal())
