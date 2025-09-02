import { io } from 'socket.io-client';

/**
 * Socket.io Client Service for Real-time Communication
 *
 * This service handles:
 * - Connection to the server's Socket.io instance
 * - Authentication with the server
 * - Receiving real-time updates
 * - Automatic reconnection
 * - User activity tracking
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map(); // Store event listeners
  }

  /**
   * Connect to the Socket.io server
   */
  connect() {
    console.log('🔌 SocketService.connect() called');
    if (this.socket && this.isConnected) {
      console.log('🔌 Socket already connected');
      return;
    }

    try {
      // Create Socket.io connection
      this.socket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventHandlers();
      console.log('🔌 Socket.io client connecting to http://localhost:5000...');
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
    }
  }

  /**
   * Setup Socket.io event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Socket connected:', this.socket.id);
      console.log('✅ Socket transport:', this.socket.io.engine.transport.name);

      // Re-authenticate if we have a userId
      if (this.userId) {
        this.authenticate(this.userId);
      }
    });

    this.socket.on('disconnect', reason => {
      this.isConnected = false;
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', error => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', attemptNumber => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Re-authenticate after reconnection
      if (this.userId) {
        this.authenticate(this.userId);
      }
    });

    // Real-time data updates
    this.socket.on('data-updated', data => {
      console.log('📨 Received data update:', data);
      this.notifyListeners('data-updated', data);
    });

    // General notifications
    this.socket.on('notification', data => {
      console.log('📢 Received notification:', data);
      this.notifyListeners('notification', data);
    });
  }

  /**
   * Authenticate user with the server
   * This tells the server which user this socket belongs to
   */
  authenticate(userId) {
    if (!this.socket || !this.isConnected) {
      console.log('⚠️ Socket not connected, will authenticate when connected');
      this.userId = userId;
      return;
    }

    this.userId = userId;
    this.socket.emit('authenticate', userId);
    console.log('🔐 Authenticated socket with user:', userId);
  }

  /**
   * Send user activity to server
   */
  sendUserActivity(userId) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('user-activity', userId);
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      console.log('🔌 Socket disconnected');
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name to listen for
   * @param {function} callback - Function to call when event occurs
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Function to remove
   */
  removeEventListener(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {any} data - Data to pass to listeners
   */
  notifyListeners(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in socket event listener:', error);
      }
    });
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create and export a singleton instance
const socketService = new SocketService();

export default socketService;
