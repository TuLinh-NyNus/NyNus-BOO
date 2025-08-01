help:
	echo "Exam Bank System Commands:"
	echo "  make setup - Initial setup"
	echo "  make dev - Start development"
	echo "  make proto - Generate protobuf"

setup:
	chmod +x tools/scripts/*.sh
	./tools/scripts/setup.sh

dev:
	./tools/scripts/dev.sh

proto:
	./tools/scripts/gen-proto.sh
