package websocket

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"nhooyr.io/websocket"
)

// TestConnectionManager_RegisterClient tests client registration
// Phase 5 - Task 5.1.2: Test client registration
func TestConnectionManager_RegisterClient(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()

	// Start manager
	go manager.Run()

	t.Run("register single client", func(t *testing.T) {
		conn := createMockWebSocketConn(t)
		client := manager.RegisterClient("user_123", "ADMIN", conn)

		assert.NotNil(t, client)
		assert.Equal(t, "user_123", client.UserID)
		assert.Equal(t, "ADMIN", client.Role)

		// Give time for registration to process
		time.Sleep(50 * time.Millisecond)

		assert.Equal(t, 1, manager.GetConnectionCount())
	})

	t.Run("register multiple clients", func(t *testing.T) {
		manager2 := NewConnectionManager()
		defer manager2.Stop()
		go manager2.Run()

		for i := 1; i <= 5; i++ {
			conn := createMockWebSocketConn(t)
			manager2.RegisterClient(string(rune(i)), "USER", conn)
		}

		time.Sleep(100 * time.Millisecond)
		assert.Equal(t, 5, manager2.GetConnectionCount())
	})

	t.Run("register same user twice should replace old connection", func(t *testing.T) {
		manager3 := NewConnectionManager()
		defer manager3.Stop()
		go manager3.Run()

		conn1 := createMockWebSocketConn(t)
		client1 := manager3.RegisterClient("user_same", "USER", conn1)

		time.Sleep(50 * time.Millisecond)
		assert.Equal(t, 1, manager3.GetConnectionCount())

		conn2 := createMockWebSocketConn(t)
		client2 := manager3.RegisterClient("user_same", "USER", conn2)

		time.Sleep(50 * time.Millisecond)
		assert.Equal(t, 1, manager3.GetConnectionCount())
		assert.NotEqual(t, client1.ID, client2.ID)
	})
}

// TestConnectionManager_UnregisterClient tests client unregistration
func TestConnectionManager_UnregisterClient(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	t.Run("unregister existing client", func(t *testing.T) {
		conn := createMockWebSocketConn(t)
		client := manager.RegisterClient("user_unreg", "USER", conn)

		time.Sleep(50 * time.Millisecond)
		assert.Equal(t, 1, manager.GetConnectionCount())

		manager.UnregisterClient(client)

		time.Sleep(50 * time.Millisecond)
		assert.Equal(t, 0, manager.GetConnectionCount())
	})

	t.Run("unregister nil client should not panic", func(t *testing.T) {
		assert.NotPanics(t, func() {
			manager.UnregisterClient(nil)
		})
	})
}

// TestConnectionManager_GetConnection tests retrieving connections
func TestConnectionManager_GetConnection(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	conn := createMockWebSocketConn(t)
	userID := "user_get"
	manager.RegisterClient(userID, "USER", conn)

	time.Sleep(50 * time.Millisecond)

	t.Run("get existing connection", func(t *testing.T) {
		client, exists := manager.GetConnection(userID)
		assert.True(t, exists)
		assert.NotNil(t, client)
		assert.Equal(t, userID, client.UserID)
	})

	t.Run("get non-existing connection", func(t *testing.T) {
		client, exists := manager.GetConnection("non_existent")
		assert.False(t, exists)
		assert.Nil(t, client)
	})
}

// TestConnectionManager_BroadcastToUser tests broadcasting to specific user
// Phase 5 - Task 5.1.2: Test broadcasting
func TestConnectionManager_BroadcastToUser(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	conn := createMockWebSocketConn(t)
	userID := "user_broadcast"
	manager.RegisterClient(userID, "USER", conn)

	time.Sleep(50 * time.Millisecond)

	t.Run("broadcast to existing user", func(t *testing.T) {
		message := []byte("test message")
		err := manager.BroadcastToUser(userID, message)
		assert.NoError(t, err)
	})

	t.Run("broadcast to non-existing user", func(t *testing.T) {
		message := []byte("test message")
		err := manager.BroadcastToUser("non_existent", message)
		// Should not error, just log warning
		assert.NoError(t, err)
	})

	t.Run("broadcast with empty userID should fail", func(t *testing.T) {
		err := manager.BroadcastToUser("", []byte("test"))
		assert.Error(t, err)
	})

	t.Run("broadcast with empty message should fail", func(t *testing.T) {
		err := manager.BroadcastToUser(userID, []byte{})
		assert.Error(t, err)
	})
}

// TestConnectionManager_BroadcastToAll tests broadcasting to all users
func TestConnectionManager_BroadcastToAll(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	// Register multiple users
	for i := 1; i <= 3; i++ {
		conn := createMockWebSocketConn(t)
		manager.RegisterClient(string(rune(i)), "USER", conn)
	}

	time.Sleep(50 * time.Millisecond)

	t.Run("broadcast to all users", func(t *testing.T) {
		message := []byte("broadcast to all")
		err := manager.BroadcastToAll(message)
		assert.NoError(t, err)
	})

	t.Run("broadcast with empty message should fail", func(t *testing.T) {
		err := manager.BroadcastToAll([]byte{})
		assert.Error(t, err)
	})
}

// TestConnectionManager_BroadcastToRole tests role-based broadcasting
func TestConnectionManager_BroadcastToRole(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	// Register users with different roles
	conn1 := createMockWebSocketConn(t)
	manager.RegisterClient("admin_1", "ADMIN", conn1)

	conn2 := createMockWebSocketConn(t)
	manager.RegisterClient("admin_2", "ADMIN", conn2)

	conn3 := createMockWebSocketConn(t)
	manager.RegisterClient("user_1", "USER", conn3)

	time.Sleep(50 * time.Millisecond)

	t.Run("broadcast to specific role", func(t *testing.T) {
		message := []byte("admin only message")
		err := manager.BroadcastToRole("ADMIN", message)
		assert.NoError(t, err)
		// Should be sent to 2 admins only
	})

	t.Run("broadcast with empty role should fail", func(t *testing.T) {
		err := manager.BroadcastToRole("", []byte("test"))
		assert.Error(t, err)
	})
}

// TestConnectionManager_ConcurrentAccess tests concurrent operations
// Phase 5 - Task 5.1.2: Test concurrent access
func TestConnectionManager_ConcurrentAccess(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	t.Run("concurrent register and unregister", func(t *testing.T) {
		done := make(chan bool)

		// Concurrent registrations
		for i := 0; i < 10; i++ {
			go func(id int) {
				conn := createMockWebSocketConn(t)
				client := manager.RegisterClient(string(rune(id)), "USER", conn)
				time.Sleep(10 * time.Millisecond)
				manager.UnregisterClient(client)
				done <- true
			}(i)
		}

		// Wait for all goroutines
		for i := 0; i < 10; i++ {
			<-done
		}

		time.Sleep(100 * time.Millisecond)
		// All should be unregistered
		assert.Equal(t, 0, manager.GetConnectionCount())
	})

	t.Run("concurrent broadcasts", func(t *testing.T) {
		// Register some clients
		for i := 0; i < 5; i++ {
			conn := createMockWebSocketConn(t)
			manager.RegisterClient(string(rune(i)), "USER", conn)
		}

		time.Sleep(50 * time.Millisecond)

		// Concurrent broadcasts
		done := make(chan bool)
		for i := 0; i < 20; i++ {
			go func(id int) {
				message := []byte("concurrent message")
				err := manager.BroadcastToAll(message)
				assert.NoError(t, err)
				done <- true
			}(i)
		}

		// Wait for all broadcasts
		for i := 0; i < 20; i++ {
			<-done
		}
	})
}

// TestConnectionManager_Metrics tests metrics tracking
func TestConnectionManager_Metrics(t *testing.T) {
	manager := NewConnectionManager()
	defer manager.Stop()
	go manager.Run()

	t.Run("metrics track connections", func(t *testing.T) {
		initialMetrics := manager.GetMetrics()

		// Register clients
		for i := 0; i < 3; i++ {
			conn := createMockWebSocketConn(t)
			manager.RegisterClient(string(rune(i)), "USER", conn)
		}

		time.Sleep(50 * time.Millisecond)

		metrics := manager.GetMetrics()
		assert.Equal(t, initialMetrics.TotalConnections+3, metrics.TotalConnections)
		assert.Equal(t, int64(3), metrics.ActiveConnections)
	})
}

// TestConnectionManager_Cleanup tests cleanup operations
// Phase 5 - Task 5.1.2: Test cleanup
func TestConnectionManager_Cleanup(t *testing.T) {
	t.Run("stop closes all connections", func(t *testing.T) {
		manager := NewConnectionManager()
		go manager.Run()

		// Register some clients
		for i := 0; i < 5; i++ {
			conn := createMockWebSocketConn(t)
			manager.RegisterClient(string(rune(i)), "USER", conn)
		}

		time.Sleep(50 * time.Millisecond)
		assert.Equal(t, 5, manager.GetConnectionCount())

		// Stop manager
		err := manager.Stop()
		assert.NoError(t, err)

		// All connections should be closed
		assert.Equal(t, 0, manager.GetConnectionCount())
	})
}

// createMockWebSocketConn creates a mock WebSocket connection for testing
func createMockWebSocketConn(t *testing.T) *websocket.Conn {
	// For unit tests, we can't create real WebSocket connections
	// This is a placeholder - in real tests, use websocket.Dial or mock
	// For now, return nil (tests will need to be updated with proper mocks)
	return nil
}

// TODO: Implement proper WebSocket connection mocking
// Options:
// 1. Use httptest.NewServer with websocket.Accept
// 2. Use websocket.Dial to create real test connections
// 3. Create mock implementation of websocket.Conn interface
