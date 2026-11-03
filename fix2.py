B=chr(92)
L=open('test_flota.py',encoding='utf-8',newline='').read().split('\n')
i=next(k for k,l in enumerate(L) if l.strip()=='f.write("import sys' )
L[i:i+3]=['            f.write("import sys'+B+'nsys.stdout.write('+"'x'"+' * 12000)'+B+'n")']
open('test_flota.py','w',encoding='utf-8',newline='').write('\n'.join(L))
