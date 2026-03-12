#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import socketserver
import webbrowser
import os
import sys
import socket
from pathlib import Path

HOST = '0.0.0.0'
START_PORT = 8080
DIRECTORY = Path(__file__).parent.absolute()

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def check_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((HOST, port))
            return False
        except socket.error:
            return True

def find_available_port(start_port):
    for port in range(start_port, start_port + 20):
        if not check_port_in_use(port):
            return port
    return None

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def open_browser(port):
    url = f"http://localhost:{port}"
    webbrowser.open(url)
    print(f"تم فتح المتصفح: {url}")

def print_banner(port, ip):
    banner = f"""
==================================================
     حاسبة التقاعد الاجتماعي العراقي
==================================================
 السيرفر يعمل على:
   http://localhost:{port}
   http://{ip}:{port}
==================================================
    """
    print(banner)

def main():
    print("\nجاري البحث عن منفذ متاح...")
    available_port = find_available_port(START_PORT)
    if available_port is None:
        print("❌ لا يمكن إيجاد منفذ متاح!")
        sys.exit(1)
    required_files = ['index.html', 'style.css', 'script.js']
    missing_files = []
    for file in required_files:
        if not (DIRECTORY / file).exists():
            missing_files.append(file)
    if missing_files:
        print("❌ الملفات التالية غير موجودة:")
        for file in missing_files:
            print(f"   - {file}")
        print(f"\n📁 المجلد الحالي: {DIRECTORY}")
        sys.exit(1)
    print("✅ جميع الملفات المطلوبة موجودة")
    print(f"📁 مسار المشروع: {DIRECTORY}")
    try:
        handler = MyHTTPRequestHandler
        server = socketserver.TCPServer((HOST, available_port), handler)
        local_ip = get_local_ip()
        print_banner(available_port, local_ip)
        import threading
        threading.Timer(1.5, open_browser, args=[available_port]).start()
        print("اضغط Ctrl+C لإيقاف السيرفر")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 إيقاف السيرفر...")
        server.shutdown()
        server.server_close()
        print("✅ تم إيقاف السيرفر بنجاح")
        sys.exit(0)
    except Exception as e:
        print(f"❌ خطأ غير متوقع: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()