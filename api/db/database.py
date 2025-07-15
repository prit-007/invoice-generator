import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import OperationalError, DatabaseError, IntegrityError
from dotenv import load_dotenv
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

class Database:
    def __init__(self):
        self.connection = None
        self.connect()

    def connect(self):
        try:
            self.connection = psycopg2.connect(
                user=USER,
                password=PASSWORD,
                host=HOST,
                port=PORT,
                dbname=DBNAME
            )
            self.connection.autocommit = True
            logger.info("Database connection successful!")
        except OperationalError as e:
            logger.error(f"Database connection failed - Operational Error: {e}")
            raise Exception(f"Database connection failed: Unable to connect to database server. Please check connection settings.")
        except DatabaseError as e:
            logger.error(f"Database connection failed - Database Error: {e}")
            raise Exception(f"Database connection failed: {str(e)}")
        except Exception as e:
            logger.error(f"Database connection failed - Unexpected Error: {e}")
            raise Exception(f"Database connection failed: {str(e)}")

    def fetch_all(self, query, params=None):
        if not self.connection:
            raise Exception("Database not connected")
        
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchall()
        except psycopg2.Error as e:
            logger.error(f"Database query error in fetch_all: {e}")
            raise Exception(f"Database query failed: {str(e)}")

    def fetch_one(self, query, params=None):
        if not self.connection:
            raise Exception("Database not connected")
            
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchone()
        except psycopg2.Error as e:
            logger.error(f"Database query error in fetch_one: {e}")
            raise Exception(f"Database query failed: {str(e)}")

    def execute(self, query, params=None):
        if not self.connection:
            raise Exception("Database not connected")
            
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                self.connection.commit()
        except IntegrityError as e:
            logger.error(f"Database integrity error: {e}")
            raise Exception(f"Data integrity violation: {str(e)}")
        except psycopg2.Error as e:
            logger.error(f"Database query error in execute: {e}")
            raise Exception(f"Database query failed: {str(e)}")

    def close(self):
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

# Initialize database connection
db = Database()
