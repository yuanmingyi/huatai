from flask import Flask
import logging.config
import os

# create the application
app = Flask(__name__)

deployment_mode = os.getenv('DEPLOYMENT_MODE')
config_object = 'config.develop'
if deployment_mode == 'sae_product':
    config_object = 'config.sae_product'

app.config.from_object(config_object)
logging.config.fileConfig('huatai/logging.conf')

import huatai.views
import huatai.controller
import huatai.errorhandler