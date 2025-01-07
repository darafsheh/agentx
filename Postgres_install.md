# Update and install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start the service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set up the database
sudo -u postgres createuser --interactive
sudo -u postgres createdb mydb

# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# Change this line:
listen_addresses = '*'

# Edit pg_hba.conf to allow connections
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Add this line for all IPs (not recommended for production):
host    all             all             0.0.0.0/0               md5
# Or for specific IP:
host    all             all             your_ip/32              md5

sudo systemctl restart postgresql

# From command line:
psql -h your_ec2_public_ip -U your_username -d your_database

# Connection string format:
postgresql://username:password@your_ec2_public_ip:5432/your_database

sudo -u postgres psql
ALTER USER your_username WITH PASSWORD 'new_password';

# Install build dependencies
sudo apt-get update
sudo apt-get install postgresql-server-dev-16 gcc make git

# Clone pgvector
cd /tmp
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector

# Build and install
make
sudo make install

# Verify the installation
ls /usr/share/postgresql/16/extension/vector*
After installation, try creating the extension again:
sqlCopypsql -U postgres
CREATE EXTENSION vector;