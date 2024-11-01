/*
  Our homepage: A Server Sent Events (SSE) stream that connects to an API route that serves
  as a sink for the Alchemy webhook.
 */

import { useEffect, useState } from "react";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    console.log("Attempting to connect to SSE...");

    const eventSource = new EventSource('/api/catchAlchemyWebhook');

    eventSource.onmessage = (event) => {
      console.log("Received event from SSE:", event.data);
      try {
        const data = JSON.parse(event.data);
        setEvents((prevEvents) => [...prevEvents, data]);
      } catch (error) {
        console.error("Failed to parse SSE event data:", error);
      }
    };

    eventSource.onopen = () => {
      console.log("SSE connection established successfully.");
    };

    eventSource.onerror = (error) => {
      console.error("SSE error encountered:", error);
      if (eventSource.readyState === EventSource.CLOSED) {
        console.warn("SSE connection closed by server.");
      } else {
        console.warn("SSE connection error");
      }
      eventSource.close();
    };

    // Cleanup function to close the connection on component unmount
    return () => {
      console.log("Closing SSE connection.");
      eventSource.close();
    };
  }, []);

  return (
      <div>
        <h1>Wallet Event Stream</h1>
        {events.length > 0 ? (
            events.map((event, index) => (
                <pre key={index} style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {JSON.stringify(event, null, 2)}
          </pre>
            ))
        ) : (
            <p>Waiting for events...</p>
        )}
      </div>
  );
}
