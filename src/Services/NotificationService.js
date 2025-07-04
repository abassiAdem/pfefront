
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
 
let stompClient = null;
let reconnectTimeout = null;
const BASE_DELAY = 1000; 
const MAX_DELAY = 30000;  
export const connectWebSocket = (userId, onMessageCallback, currentDelay = BASE_DELAY) => {
  if (stompClient && stompClient.connected) {
    console.warn("WebSocket already connected");
    return;
  }
 
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  const serverUrl = "http://localhost:8787/ws";

  try {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(serverUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.debug(str),

      onConnect: () => {
        const subscription = `/topic/notifications/${userId}`;
        
        stompClient.subscribe(subscription, (message) => {
          try {
            const notification = JSON.parse(message.body);
            onMessageCallback(message);
          } catch (error) {
            console.error("Error processing notification:", error);
          }
        });
      },
      
      onDisconnect: () => {
        scheduleReconnect(userId, onMessageCallback, BASE_DELAY);
      },
      
      onStompError: (frame) => {
        console.error("STOMP protocol error:", frame.headers.message);
        if (!stompClient?.connected) {
          scheduleReconnect(userId, onMessageCallback, currentDelay * 2);
        }
      },
      
      onWebSocketError: (error) => {
        console.error("WebSocket transport error:", error);
        scheduleReconnect(userId, onMessageCallback, currentDelay * 2);
      }
    });

    stompClient.activate();
  } catch (error) {
    console.error("Error initializing WebSocket:", error);
    scheduleReconnect(userId, onMessageCallback, currentDelay * 2);
  }
};

const scheduleReconnect = (userId, onMessageCallback, delay) => {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
   
  const nextDelay = Math.min(delay, MAX_DELAY);
  
  reconnectTimeout = setTimeout(() => {
    connectWebSocket(userId, onMessageCallback, nextDelay);
  }, nextDelay);
};

export const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (stompClient) {
    try {
      stompClient.deactivate().then(() => {
      }).catch(error => {
        console.error("Error during WebSocket deactivation:", error);
      });
    } catch (error) {
      console.error("Error disconnecting WebSocket:", error);
    } finally {
      stompClient = null;
    }
  }
};
