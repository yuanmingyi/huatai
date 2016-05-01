from flask import Flask
import logging.config

# create the application
app = Flask(__name__)
app.config.from_object('huatai.config')
logging.config.fileConfig('huatai/logging.conf')

import huatai.views
import huatai.controller
import huatai.errorhandler