# configuration
import sae.const
DB_SCHEMA = 'mysql'
DB_HOST = sae.const.MYSQL_HOST #os.getenv('SAE_MYSQL_HOST_M')
DB_PORT = sae.const.MYSQL_PORT #os.getenv('SAE_MYSQL_PORT')
DB_USERNAME = sae.const.MYSQL_USER #os.getenv('SAE_MYSQL_USER')
DB_PASSWORD = sae.const.MYSQL_PASS #os.getenv('SAE_MYSQL_PASS')
DATABASE = sae.const.MYSQL_DB
DEBUG = True
LOGGING_CONF = 'config/logging_sae.conf'
#SQLALCHEMY_COMMIT_ON_TEARDOWN = True
