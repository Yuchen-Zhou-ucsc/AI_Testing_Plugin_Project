#!/bin/bash

echo "Stopping AI Testing Plugin Project..."

lsof -ti :5000 | xargs kill 2>/dev/null
lsof -ti :5173 | xargs kill 2>/dev/null

echo "AI Testing Plugin Project stopped."
