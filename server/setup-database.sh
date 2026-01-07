#!/bin/bash

# Mini-Gather PostgreSQL Database Setup Script
# This script automates the database creation and setup process for Linux systems
# Author: Mini-Gather Team
# Version: 1.0.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_DB_NAME="minigather"
DEFAULT_DB_USER="postgres"
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="5432"

# Print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_info "Checking PostgreSQL installation..."

    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version | awk '{print $3}')
        print_success "PostgreSQL ${PG_VERSION} is installed"
        return 0
    else
        print_error "PostgreSQL is not installed!"
        echo ""
        print_info "Installation instructions:"
        echo ""
        echo "  Ubuntu/Debian:"
        echo "    sudo apt update"
        echo "    sudo apt install postgresql postgresql-contrib"
        echo ""
        echo "  Fedora/RHEL/CentOS:"
        echo "    sudo dnf install postgresql-server postgresql-contrib"
        echo "    sudo postgresql-setup --initdb"
        echo "    sudo systemctl enable postgresql"
        echo "    sudo systemctl start postgresql"
        echo ""
        echo "  Arch Linux:"
        echo "    sudo pacman -S postgresql"
        echo "    sudo -u postgres initdb -D /var/lib/postgres/data"
        echo "    sudo systemctl enable postgresql"
        echo "    sudo systemctl start postgresql"
        echo ""
        return 1
    fi
}

# Check if Node.js and npm are installed
check_node() {
    print_info "Checking Node.js installation..."

    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        print_success "Node.js ${NODE_VERSION} and npm ${NPM_VERSION} are installed"
        return 0
    else
        print_error "Node.js or npm is not installed!"
        echo ""
        print_info "Please install Node.js from: https://nodejs.org/"
        return 1
    fi
}

# Prompt for database configuration
get_database_config() {
    print_header "Database Configuration"

    echo "Enter database details (press Enter to use defaults):"
    echo ""

    read -p "Database name [${DEFAULT_DB_NAME}]: " DB_NAME
    DB_NAME=${DB_NAME:-$DEFAULT_DB_NAME}

    read -p "PostgreSQL user [${DEFAULT_DB_USER}]: " DB_USER
    DB_USER=${DB_USER:-$DEFAULT_DB_USER}

    read -sp "PostgreSQL password: " DB_PASSWORD
    echo ""

    read -p "Database host [${DEFAULT_DB_HOST}]: " DB_HOST
    DB_HOST=${DB_HOST:-$DEFAULT_DB_HOST}

    read -p "Database port [${DEFAULT_DB_PORT}]: " DB_PORT
    DB_PORT=${DB_PORT:-$DEFAULT_DB_PORT}

    # Construct DATABASE_URL
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

    echo ""
    print_info "Configuration:"
    echo "  Database: ${DB_NAME}"
    echo "  User: ${DB_USER}"
    echo "  Host: ${DB_HOST}:${DB_PORT}"
    echo ""
}

# Test PostgreSQL connection
test_connection() {
    print_info "Testing PostgreSQL connection..."

    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" &> /dev/null; then
        print_success "Connection successful"
        return 0
    else
        print_error "Connection failed"
        print_warning "Please check your credentials and ensure PostgreSQL is running"
        print_info "Start PostgreSQL: sudo systemctl start postgresql"
        return 1
    fi
}

# Create database
create_database() {
    print_info "Creating database '${DB_NAME}'..."

    # Check if database already exists
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_warning "Database '${DB_NAME}' already exists"
        read -p "Do you want to drop and recreate it? (y/N): " RECREATE

        if [[ $RECREATE =~ ^[Yy]$ ]]; then
            print_info "Dropping existing database..."
            PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
            print_success "Database dropped"
        else
            print_info "Using existing database"
            return 0
        fi
    fi

    # Create database
    if PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME; then
        print_success "Database '${DB_NAME}' created"
        return 0
    else
        print_error "Failed to create database"
        return 1
    fi
}

# Update .env file
update_env_file() {
    print_info "Updating .env file..."

    ENV_FILE=".env"

    # Create .env from .env.example if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example $ENV_FILE
            print_info "Created .env from .env.example"
        else
            touch $ENV_FILE
            print_info "Created new .env file"
        fi
    fi

    # Update DATABASE_URL in .env
    if grep -q "^DATABASE_URL=" $ENV_FILE; then
        # Replace existing DATABASE_URL
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" $ENV_FILE
        else
            # Linux
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" $ENV_FILE
        fi
    else
        # Add DATABASE_URL
        echo "DATABASE_URL=\"${DATABASE_URL}\"" >> $ENV_FILE
    fi

    print_success ".env file updated"
}

# Install dependencies
install_dependencies() {
    print_info "Installing npm dependencies..."

    if npm install; then
        print_success "Dependencies installed"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Run Prisma migrations
run_migrations() {
    print_info "Running Prisma migrations..."

    # Generate Prisma Client first
    if npx prisma generate; then
        print_success "Prisma Client generated"
    else
        print_error "Failed to generate Prisma Client"
        return 1
    fi

    # Run migrations
    if npx prisma migrate deploy; then
        print_success "Migrations completed"
        return 0
    else
        print_warning "Migration deployment failed, trying migrate dev..."
        if npx prisma migrate dev --name init; then
            print_success "Migrations completed (dev mode)"
            return 0
        else
            print_error "Failed to run migrations"
            return 1
        fi
    fi
}

# Verify database setup
verify_setup() {
    print_info "Verifying database setup..."

    # List tables
    TABLES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>/dev/null | wc -l)

    if [ "$TABLES" -gt 0 ]; then
        print_success "Found $TABLES table(s) in database"
        echo ""
        print_info "Tables:"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt" | grep -E "users|rooms|chat_messages" || true
        return 0
    else
        print_warning "No tables found in database"
        return 1
    fi
}

# Print final summary
print_summary() {
    print_header "Setup Complete!"

    echo -e "${GREEN}✅ Database setup successful!${NC}"
    echo ""
    echo "Connection details:"
    echo "  Database: ${DB_NAME}"
    echo "  Host: ${DB_HOST}:${DB_PORT}"
    echo "  User: ${DB_USER}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Start the server:"
    echo "     npm run dev"
    echo ""
    echo "  2. Access the database:"
    echo "     psql -U ${DB_USER} -d ${DB_NAME}"
    echo ""
    echo "  3. View data with Prisma Studio:"
    echo "     npm run prisma:studio"
    echo ""
    echo "  4. Run migrations:"
    echo "     npm run prisma:migrate"
    echo ""
}

# Main execution
main() {
    print_header "Mini-Gather Database Setup"

    # Check prerequisites
    if ! check_postgresql; then
        exit 1
    fi

    if ! check_node; then
        exit 1
    fi

    # Get configuration
    get_database_config

    # Test connection
    if ! test_connection; then
        exit 1
    fi

    # Create database
    if ! create_database; then
        exit 1
    fi

    # Update .env
    update_env_file

    # Install dependencies
    if ! install_dependencies; then
        exit 1
    fi

    # Run migrations
    if ! run_migrations; then
        print_error "Migration failed, but database was created"
        print_info "You can run migrations manually with: npm run prisma:migrate"
    fi

    # Verify setup
    verify_setup

    # Print summary
    print_summary
}

# Run main function
main
