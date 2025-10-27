package entity

import "time"

// Tag represents a tag entity for categorization
type Tag struct {
	ID          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Color       string    `db:"color" json:"color"`
	IsTrending  bool      `db:"is_trending" json:"is_trending"`
	UsageCount  int       `db:"usage_count" json:"usage_count"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

// ItemTag represents the relationship between items and tags
type ItemTag struct {
	ItemID    string    `db:"item_id" json:"item_id"`
	TagID     string    `db:"tag_id" json:"tag_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

