import sae
sae.add_vendor_dir('env/lib/python2.7/site-packages')

import os
os.environ['DEPLOYMENT_MODE'] = 'sae_product'
if 'SERVER_SOFTWARE' not in os.environ:
    from sae._restful_mysql import monkey
    monkey.patch()

from huatai import app
application = sae.create_wsgi_app(app)
