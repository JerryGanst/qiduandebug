// src/utils/sse.js
export function createSSEConnection(query, usrid, onMessage, onError) {
  const url = `https://api.deepseek.com/sse?query=${encodeURIComponent(query)}&usrid=${encodeURIComponent(usrid)}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  return eventSource;
}