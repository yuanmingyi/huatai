from flask import Flask
from dbservice import DBService
import logging.config
import os

# create the application
app = Flask(__name__)

deployment_mode = os.getenv('DEPLOYMENT_MODE')
config_object = 'config.develop'
if deployment_mode == 'sae_product':
    config_object = 'config.sae_product'

app.config.from_object(config_object)
logging.config.fileConfig(app.config['LOGGING_CONF'])

db = DBService.init_db(app)

import huatai.views
import huatai.controller
import huatai.errorhandler
