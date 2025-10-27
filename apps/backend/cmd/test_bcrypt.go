//go:build tools

package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Password from database
	hash := "$2b$10$9kQ75u2a42Iu8V7WW/EMq.cFQGGLa5Ool.lueXNIKs7aRNAY8vpfe"
	password := "Abd8stbcs!"

	// Test bcrypt compare
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		log.Fatalf("❌ Password does NOT match: %v", err)
	}

	fmt.Println("✅ Password matches!")
}
