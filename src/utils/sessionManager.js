// utils/sessionManager.js
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

class SessionManager {
  constructor() {
    this.timeoutId = null;
    this.sessionTimeout = 60 * 60 * 1000; // 1 hour 
    // this.sessionTimeout = 5 * 1000; // 5 seconds for testing purpose
    this.isActive = false;
  }

  startSession() {
    this.isActive = true;
    this.resetTimeout();
    this.addEventListeners();
  }

  resetTimeout() {
    // Clear existing timeouts
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (!this.isActive) return;

    // Set logout timeout
    this.timeoutId = setTimeout(() => {
      this.logout();
    }, this.sessionTimeout);
  }

  async logout() {
    try {
      this.endSession();
      await signOut(auth);
      console.log('User logged out due to inactivity');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  addEventListeners() {
    const events = [
      'mousedown', 
      'mousemove', 
      'keypress', 
      'scroll', 
      'touchstart', 
      'click',
      'keydown'
    ];
    
    const resetHandler = () => {
      if (this.isActive) {
        this.resetTimeout();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, resetHandler, true);
    });

    // Store reference to remove listeners later
    this.resetHandler = resetHandler;
    this.events = events;
  }

  endSession() {
    this.isActive = false;
    
    // Clear timeouts
    if (this.timeoutId) clearTimeout(this.timeoutId);
    
    // Remove event listeners
    if (this.resetHandler && this.events) {
      this.events.forEach(event => {
        document.removeEventListener(event, this.resetHandler, true);
      });
    }
  }
}

const sessionManager = new SessionManager();
export default sessionManager;