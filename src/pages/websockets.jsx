import React, { useState, useRef, useEffect } from "react";

const Chat = () => {
  const [clientId] = useState(Date.now());
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    // connect
    ws.current = new WebSocket(`ws://192.168.8.114:8000/posts/ws/${clientId}`);

    // FIX 1: Correct spelling of 'onmessage'
    ws.current.onmessage = (event) => {
      // FIX 2: Correct property is 'event.data' (not event.date)
      const data = JSON.parse(event.data);

      setMessages((prevMessage) => [...prevMessage, data?.comments?.comment]);
    };

    ws.current.onclose = () => console.log("Websocket disconnected");

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
    // FIX 3: Dependency must be an array [...]
  }, [clientId]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (ws.current && inputValue.trim() !== "") {
      ws.current.send(inputValue);
      setInputValue("");
    }
  };

  return (
    <div>
      <h1>My chat App</h1>
      <h2>
        Your Id <span>{clientId} </span>
      </h2>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
