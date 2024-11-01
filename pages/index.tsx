import { useEffect, useState } from "react";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    console.log("Attempting to connect to SSE...");

    const eventSource = new EventSource('/api/catchAlchemyWebhook');

    // Event fired when a message is received from the server
    eventSource.onmessage = (event) => {
      console.log("Received event from SSE:", event.data);
      try {
        const data = JSON.parse(event.data);
        setEvents((prevEvents) => [...prevEvents, data]);
      } catch (error) {
        console.error("Failed to parse SSE event data:", error);
      }
    };

    // Event fired when the connection is established
    eventSource.onopen = () => {
      console.log("SSE connection established successfully.");
    };

    // Event fired when there is an error with the connection
    eventSource.onerror = (error) => {
      console.error("SSE error encountered:", error);
      if (eventSource.readyState === EventSource.CLOSED) {
        console.warn("SSE connection closed by server.");
      } else {
        console.warn("SSE connection error");
      }
      eventSource.close(); // Close the connection on error
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
