import { useEffect, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import WebSocketComponent from "@/pages/components/WebsocketComponent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [events, setEvents] = useState<any[]>([]); // State to store received events

  useEffect(() => {
    const eventSource = new EventSource('/api/catchAlchemyWebhook'); // Connect to your SSE endpoint

    // Listen for messages from the server
    eventSource.onmessage = (event) => {
      const data = event.data;
      setEvents((prevEvents) => [...prevEvents, data]); // Add new event data to state
      console.log("Received event:", data); // Log the event data
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close(); // Close the connection if there's an error
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return (
      <div>
        <div>
          <h1>Wallet Event Stream</h1>
          {events.length > 0 ? (
              events.map((event, index) => (
                  <div key={index}>
                    <p>{JSON.stringify(event)}</p>
                  </div>
              ))
          ) : (
              <p>No events yet...</p>
          )}
        </div>
      </div>
  );
}
