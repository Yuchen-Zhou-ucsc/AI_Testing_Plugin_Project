#!/usr/bin/env bash

echo "Stopping AI Testing Plugin Project..."

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"

stop_process() {
  local name="$1"
  local pid_file="$PID_DIR/$name.pid"

  if [ ! -f "$pid_file" ]; then
    echo "No saved PID for $name."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if kill "$pid" 2>/dev/null; then
    echo "Stopped $name with PID $pid."
  else
    echo "$name was not running."
  fi

  rm -f "$pid_file"
}

stop_process backend
stop_process frontend

echo "AI Testing Plugin Project stopped."
