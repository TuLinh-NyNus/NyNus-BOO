package util

import (
	"log"
	"os"

	"github.com/sirupsen/logrus"
)

// StandardLogger creates a standard logger with consistent format
// Format: 2025/10/27 18:11:05
func StandardLogger() *log.Logger {
	return log.New(os.Stdout, "", log.LstdFlags)
}

// StandardLogrusLogger creates a logrus logger with consistent format
// Format: 2025/01/27 18:11:05
func StandardLogrusLogger() *logrus.Logger {
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)
	logger.SetOutput(os.Stdout)
	logger.SetFormatter(StandardLogrusFormatter())
	return logger
}

// StandardLogrusFormatter returns the standard log formatter
// Format: 2025/01/27 18:11:05
func StandardLogrusFormatter() *logrus.TextFormatter {
	return &logrus.TextFormatter{
		TimestampFormat:        "2006/01/02 15:04:05",
		FullTimestamp:          true,
		DisableTimestamp:       false,
		ForceColors:            false,
		DisableColors:          true,
		ForceQuote:             false,
		DisableQuote:           true,
		DisableLevelTruncation: false,
	}
}

// StandardLogFormat is the time format used across the application
const StandardLogFormat = "2006/01/02 15:04:05"
