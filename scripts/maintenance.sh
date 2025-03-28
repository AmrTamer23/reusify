#!/bin/bash

# Maintenance script for reusify application
# This script helps with common Docker operations

# Function to print colored output
print_message() {
  GREEN='\033[0;32m'
  NC='\033[0m' # No Color
  echo -e "${GREEN}$1${NC}"
}

# Function to print error messages
print_error() {
  RED='\033[0;31m'
  NC='\033[0m' # No Color
  echo -e "${RED}$1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
  print_error "Error: docker-compose.yml not found. Make sure you're in the reusify application directory."
  exit 1
fi

# Display help message
show_help() {
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  start        Start the application containers"
  echo "  stop         Stop the application containers"
  echo "  restart      Restart the application containers"
  echo "  logs         Show container logs"
  echo "  status       Show container status"
  echo "  rebuild      Rebuild and restart containers"
  echo "  prune        Remove unused Docker resources"
  echo "  help         Show this help message"
}

# Process commands
case "$1" in
  start)
    print_message "Starting application containers..."
    docker-compose up -d
    ;;
  stop)
    print_message "Stopping application containers..."
    docker-compose down
    ;;
  restart)
    print_message "Restarting application containers..."
    docker-compose down
    docker-compose up -d
    ;;
  logs)
    print_message "Showing container logs..."
    if [ -z "$2" ]; then
      docker-compose logs --tail=100 -f
    else
      docker-compose logs --tail=100 -f "$2"
    fi
    ;;
  status)
    print_message "Container status:"
    docker-compose ps
    ;;
  rebuild)
    print_message "Rebuilding application containers..."
    docker-compose build
    docker-compose down
    docker-compose up -d
    ;;
  prune)
    print_message "Removing unused Docker resources..."
    docker system prune -af
    ;;
  help|*)
    show_help
    ;;
esac 