B=chr(92); N=B+"n"
f=open('flota.py',encoding='utf-8',newline='').read()
f=f.replace('auth status\n")', 'auth status'+N+'")')
f=f.replace('CLAUDE_PROJECT_DIR", lambda','CLAUDE_PROJECT_DIR'+B+'b", lambda').replace('CLAUDE_PROJECT_DIR\x08", lambda','CLAUDE_PROJECT_DIR'+B+'b", lambda')
open('flota.py','w',encoding='utf-8',newline='').write(f)
t=open('test_flota.py',encoding='utf-8',newline='').read()
t=t.replace("f.write(\"import sys\nsys.stdout.write('x' * 12000)\n\")","f.write(\"import sys"+N+"sys.stdout.write('x' * 12000)"+N+"\")")
t=t.replace('return_value=r),                 contextlib','return_value=r), \\n                contextlib')
open('test_flota.py','w',encoding='utf-8',newline='').write(t)
