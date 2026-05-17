#!/bin/bash
# SNC-TAX Deployment Script
# Usage: ./scripts/deploy.sh [up|down|restart|logs|status]

set -e

ACTION=${1:-up}
COMPOSE_FILE="docker-compose.yml"

echo "=================================="
echo "SNC-TAX Compl-Ai™ Deployment"
echo "=================================="

case $ACTION in
  up)
    echo "Starting all services..."
    docker compose -f $COMPOSE_FILE up -d --build
    echo ""
    echo "Waiting for services to be healthy..."
    sleep 10
    docker compose -f $COMPOSE_FILE ps
    echo ""
    echo "✓ Deployment complete!"
    echo "  Frontend: http://localhost"
    echo "  Backend:  http://localhost:5000"
    echo "  Health:   http://localhost:5000/health"
    ;;

  down)
    echo "Stopping all services..."
    docker compose -f $COMPOSE_FILE down
    echo "✓ All services stopped"
    ;;

  restart)
    echo "Restarting services..."
    docker compose -f $COMPOSE_FILE restart
    echo "✓ Services restarted"
    ;;

  logs)
    SERVICE=${2:-}
    if [ -z "$SERVICE" ]; then
      docker compose -f $COMPOSE_FILE logs -f --tail=100
    else
      docker compose -f $COMPOSE_FILE logs -f --tail=100 "$SERVICE"
    fi
    ;;

  status)
    docker compose -f $COMPOSE_FILE ps
    echo ""
    echo "Health check:"
    curl -s http://localhost:5000/health | python3 -m json.tool 2>/dev/null || echo "Backend not responding"
    ;;

  build)
    echo "Rebuilding images..."
    docker compose -f $COMPOSE_FILE build --no-cache
    echo "✓ Build complete"
    ;;

  db-migrate)
    echo "Running database migrations..."
    docker compose -f $COMPOSE_FILE exec backend node -e "
      import('./src/utils/runMigrations.js').then(m => m.default()).catch(console.error)
    "
    ;;

  backup)
    echo "Running database backup..."
    bash scripts/backup-db.sh
    ;;

  *)
    echo "Usage: $0 {up|down|restart|logs|status|build|db-migrate|backup}"
    echo ""
    echo "Commands:"
    echo "  up          Start all services"
    echo "  down        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs [svc]  View logs (optional: backend, frontend, database)"
    echo "  status      Show service status and health"
    echo "  build       Rebuild Docker images"
    echo "  db-migrate  Run database migrations"
    echo "  backup      Backup database"
    exit 1
    ;;
esac
