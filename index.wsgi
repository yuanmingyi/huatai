import sae
import os

os.environ['DEPLOYMENT_MODE'] = 'sae_product'

from huatai import app

application = sae.create_wsgi_app(app)