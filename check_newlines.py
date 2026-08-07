import sys
code = open(r'c:\Users\Vroth\OneDrive\Masaüstü\Vrother9\site proje\v9testsite1\script.js', 'r', encoding='utf-8').read()
import re
# find single quotes with literal newline
for match in re.finditer(r'\'[^\'\r\n]*?\n[^\'\r\n]*?\'', code):
    print('Found newline in single quote:', repr(match.group(0)))
# find double quotes with literal newline
for match in re.finditer(r'\"[^\"\r\n]*?\n[^\"\r\n]*?\"', code):
    print('Found newline in double quote:', repr(match.group(0)))
