import uuid, socket

def get_mac():
    mac = '%02X' % uuid.getnode()
    return '-'.join([mac[i:i+2] for i in range(0, len(mac), 2)])

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    addr, port = s.getsockname()
    return addr

def get_hdd_info():
    return ''