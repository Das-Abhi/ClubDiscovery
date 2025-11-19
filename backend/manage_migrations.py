#!/usr/bin/env python
"""
Database Migration Management Script for ClubCompass

This script provides a convenient interface for managing Alembic database migrations.

Usage:
    python manage_migrations.py init           # Stamp database at current state (first time setup)
    python manage_migrations.py create "msg"   # Create a new migration
    python manage_migrations.py upgrade        # Upgrade to latest version
    python manage_migrations.py downgrade      # Downgrade one version
    python manage_migrations.py current        # Show current revision
    python manage_migrations.py history        # Show migration history
    python manage_migrations.py check          # Check if migrations are needed
"""
import sys
import subprocess
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_colored(message: str, color: str = RESET):
    """Print colored message to console"""
    print(f"{color}{message}{RESET}")


def run_alembic_command(command: list[str]) -> int:
    """Run an alembic command and return exit code"""
    try:
        result = subprocess.run(
            ["python", "-m", "alembic"] + command,
            cwd=Path(__file__).parent,
            check=False
        )
        return result.returncode
    except Exception as e:
        print_colored(f"Error running alembic: {e}", RED)
        return 1


def cmd_init():
    """Initialize Alembic for an existing database (stamp current state)"""
    print_colored("🔧 Initializing Alembic for existing database...", BLUE)
    print_colored("This will mark the current database state without running migrations.", YELLOW)
    print()

    confirm = input("Continue? (y/n): ")
    if confirm.lower() != 'y':
        print_colored("Aborted.", RED)
        return 1

    # Stamp the database at head revision
    print_colored("\n📌 Stamping database at 'head' revision...", BLUE)
    return run_alembic_command(["stamp", "head"])


def cmd_create(message: str = None):
    """Create a new migration"""
    if not message:
        print_colored("Error: Migration message is required", RED)
        print_colored("Usage: python manage_migrations.py create \"Your migration message\"", YELLOW)
        return 1

    print_colored(f"📝 Creating new migration: {message}", BLUE)
    return run_alembic_command(["revision", "--autogenerate", "-m", message])


def cmd_upgrade(revision: str = "head"):
    """Upgrade database to a specific revision or head"""
    print_colored(f"⬆️  Upgrading database to: {revision}", BLUE)
    return run_alembic_command(["upgrade", revision])


def cmd_downgrade(revision: str = "-1"):
    """Downgrade database by one revision or to specific revision"""
    print_colored(f"⬇️  Downgrading database to: {revision}", YELLOW)
    print_colored("Warning: This will revert database changes!", RED)

    confirm = input("Continue? (y/n): ")
    if confirm.lower() != 'y':
        print_colored("Aborted.", RED)
        return 1

    return run_alembic_command(["downgrade", revision])


def cmd_current():
    """Show current database revision"""
    print_colored("📍 Current database revision:", BLUE)
    return run_alembic_command(["current"])


def cmd_history():
    """Show migration history"""
    print_colored("📚 Migration history:", BLUE)
    return run_alembic_command(["history", "--verbose"])


def cmd_check():
    """Check if database is up to date"""
    print_colored("🔍 Checking migration status...", BLUE)

    # Get current revision
    result = subprocess.run(
        ["python", "-m", "alembic", "current"],
        cwd=Path(__file__).parent,
        capture_output=True,
        text=True
    )

    current = result.stdout.strip()

    # Get head revision
    result = subprocess.run(
        ["python", "-m", "alembic", "heads"],
        cwd=Path(__file__).parent,
        capture_output=True,
        text=True
    )

    head = result.stdout.strip()

    if current == head:
        print_colored("✅ Database is up to date!", GREEN)
        return 0
    else:
        print_colored("⚠️  Database needs migration!", YELLOW)
        print(f"Current: {current}")
        print(f"Head: {head}")
        return 1


def print_usage():
    """Print usage information"""
    print_colored("Database Migration Management Script", BLUE)
    print()
    print("Usage:")
    print(f"  {GREEN}python manage_migrations.py init{RESET}              Initialize for existing database")
    print(f"  {GREEN}python manage_migrations.py create <message>{RESET}  Create new migration")
    print(f"  {GREEN}python manage_migrations.py upgrade [revision]{RESET} Upgrade to revision (default: head)")
    print(f"  {GREEN}python manage_migrations.py downgrade [revision]{RESET} Downgrade to revision (default: -1)")
    print(f"  {GREEN}python manage_migrations.py current{RESET}            Show current revision")
    print(f"  {GREEN}python manage_migrations.py history{RESET}            Show migration history")
    print(f"  {GREEN}python manage_migrations.py check{RESET}              Check if migrations needed")
    print()
    print("Examples:")
    print(f'  {YELLOW}python manage_migrations.py create "Add user roles"{RESET}')
    print(f'  {YELLOW}python manage_migrations.py upgrade{RESET}')
    print(f'  {YELLOW}python manage_migrations.py downgrade -1{RESET}')


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print_usage()
        return 1

    command = sys.argv[1].lower()

    commands = {
        "init": cmd_init,
        "create": lambda: cmd_create(sys.argv[2] if len(sys.argv) > 2 else None),
        "upgrade": lambda: cmd_upgrade(sys.argv[2] if len(sys.argv) > 2 else "head"),
        "downgrade": lambda: cmd_downgrade(sys.argv[2] if len(sys.argv) > 2 else "-1"),
        "current": cmd_current,
        "history": cmd_history,
        "check": cmd_check,
        "help": lambda: (print_usage(), 0)[1],
    }

    if command not in commands:
        print_colored(f"Unknown command: {command}", RED)
        print_usage()
        return 1

    return commands[command]()


if __name__ == "__main__":
    sys.exit(main())
