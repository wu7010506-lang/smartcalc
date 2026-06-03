import requests
from bs4 import BeautifulSoup
import json

url = 'https://www.bot.com.tw/tw/personal-banking/loan/housing-loan/mortgage-rates'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

# 簡單抓取頁面上包含「利率」的文字片段作為測試
rates = []
for p in soup.find_all(['p', 'div', 'td']):
    if '利率' in p.text and len(p.text) < 50:
        rates.append(p.text.strip())

with open('rates.json', 'w', encoding='utf-8') as f:
    json.dump(rates, f, ensure_ascii=False)
    
print("Found", len(rates), "possible rate entries.")
