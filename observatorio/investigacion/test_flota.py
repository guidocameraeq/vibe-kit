"""Pruebas de flota.py: sin red, sin gh real. gh y node se reemplazan por funciones inyectadas.
Correr: py -3 -m unittest test_flota -v   (desde observatorio/investigacion)"""
import base64, contextlib, io, json, os, shutil, subprocess, sys, tempfile, time, unittest

import flota

SELLO = "- Sello del Arquitecto: `arquitecto: 2026-11-03 · kit 2.4.3 · chequeos: tamaño ✅ · hash 55e763f81745`\n"
FICHA_OK = "---\nkit: 2.4.2\nnivel: estandar\n---\n"
FICHA_JSON = {"kit": "2.4.2", "nivel": "estandar",
              "piezas": {"inicio": {"estado": "molde+propio", "hash": "a2097e796b00"},
                         "candado": "molde", "hook-sensible": "adaptada", "smoke": "no"},
              "frenos": {"opcionales": [], "quitados": [{"id": "a"}, {"id": "b"}]}}
SECRETO = "TEXTO-SECRETO-DE-LA-FICHA"
ALFA = r"D:\vibe-kit-pruebas\remotos\alfa.git"


def repo(name="r", owner="o"):
    return {"owner": owner, "name": name, "isPrivate": False, "createdAt": "2026-01-01T00:00:00Z",
            "pushedAt": "2026-10-01T00:00:00Z", "diskUsage": 10, "defaultBranchRef": {"name": "main"}}


def fake_gh(files, branches=("main",)):
    """files: {ruta: texto}. Sirve árbol, contents, branches; commits y contributors vacíos."""
    def gh(args, raw=False):
        url = args[-1]
        if "/git/trees/" in url:
            return {"truncated": False, "tree": [{"path": p, "type": "blob", "size": len(t.encode())}
                                                 for p, t in files.items()]}
        if "/contents/" in url:
            p = url.split("/contents/")[1].split("?")[0]
            if p not in files:
                return None
            return {"content": base64.b64encode(files[p].encode()).decode()}
        if "/branches" in url:
            return [{"name": b} for b in branches]
        if "/commits" in url:
            return "" if raw else []
        return None
    return gh


def fake_node(args):
    """Hace de ficha.cjs: lee el archivo temporal que le pasan."""
    with open(args[-1], encoding="utf-8") as f:
        texto = f.read()
    if texto.startswith("ROTA"):
        return 1, "", f"{args[-1]}:3: comilla sin cerrar en {SECRETO}\n"
    return 0, json.dumps(FICHA_JSON), ""


def scan(files, branches=("main",), frases=(), node=fake_node):
    return flota.scan(repo(), gh=fake_gh(files, branches), node=node, kit="/no/importa", frases=frases)


class Ficha(unittest.TestCase):
    def test_ficha_valida_da_las_columnas(self):
        r = scan({".claude/kit.md": FICHA_OK})
        self.assertEqual(r["kit"], "2.4.2")
        self.assertEqual(r["nivel"], "estandar")
        self.assertEqual(r["piezas"]["inicio"], "molde+propio")
        self.assertEqual(r["piezas"]["candado"], "molde")
        self.assertEqual(r["frenos_quitados"], 2)
        self.assertNotIn("ficha_error", r)
        self.assertEqual(r["barreras"]["hook_sensible"], "adaptada")
        self.assertEqual(r["barreras"]["candado"], "molde")

    def test_ficha_rota_da_ficha_error_sin_el_texto(self):
        r = scan({".claude/kit.md": "ROTA " + SECRETO})
        self.assertIsNone(r["kit"])
        self.assertIn("malformada", r["ficha_error"])
        self.assertIn("línea 3", r["ficha_error"])
        self.assertNotIn(SECRETO, json.dumps(r, ensure_ascii=False))

    def test_sin_ficha_kit_null_y_sigue(self):
        r = scan({"README.md": "hola"})
        self.assertIsNone(r["kit"])
        self.assertNotIn("ficha_error", r)
        self.assertEqual(r["repo"], "o/r")

    @unittest.skipUnless(shutil.which("node") and shutil.which("git") and os.path.isdir(ALFA),
                         "necesita node y el remoto de prueba alfa")
    def test_ficha_real_de_alfa_con_el_parser_del_kit(self):
        kit = os.path.dirname(os.path.dirname(flota.AQUI))
        txt = subprocess.run(["git", "-C", ALFA, "show", "HEAD:.claude/kit.md"],
                             capture_output=True, text=True, encoding="utf-8").stdout
        r = flota.scan(repo("alfa"), gh=fake_gh({".claude/kit.md": txt}), node=flota.node_real, kit=kit)
        self.assertEqual(r["kit"], "2.4.2")
        self.assertEqual(r["nivel"], "estandar")
        self.assertEqual(r["piezas"]["candado"], "molde")
        self.assertEqual(r["piezas"]["smoke"], "no")


class Ramas(unittest.TestCase):
    def test_rama_kit_viva_cuenta_uno_y_main_no(self):
        r = scan({"README.md": "x"}, branches=("main", "kit/v3.0.0", "feature/kit-algo"))
        self.assertEqual(r["ramas_kit_n"], 1)
        self.assertEqual(r["ramas_kit"], ["kit/v3.0.0"])

    def test_solo_main_cuenta_cero(self):
        self.assertEqual(scan({"README.md": "x"})["ramas_kit_n"], 0)

    def test_copias_del_kit(self):
        r = scan({".claude/skills/arquitecto/SKILL.md": "a", ".claude/skills/inicio/SKILL.md": "b",
                  ".claude/skills/mia/SKILL.md": "c"})
        self.assertEqual(r["copias_del_kit"], ["arquitecto"])


class AparecenEn(unittest.TestCase):
    def filas(self, n):
        return [{"skills": ["inicio", "arquitecto", "propia"] if i < n else ["inicio"]} for i in range(5)]

    def test_skill_propia_en_3_repos_marcada(self):
        t = {x["skill"]: x for x in flota.aparece_en(self.filas(3))}
        self.assertEqual(t["propia"]["repos"], 3)
        self.assertTrue(t["propia"]["regla_de_3"])
        self.assertNotIn("inicio", t)       # universal
        self.assertNotIn("arquitecto", t)   # del kit

    def test_skill_propia_en_2_repos_no_marcada(self):
        t = {x["skill"]: x for x in flota.aparece_en(self.filas(2))}
        self.assertEqual(t["propia"]["repos"], 2)
        self.assertFalse(t["propia"]["regla_de_3"])


class FrasesYRutas(unittest.TestCase):
    FR = ["regla de bolsillo"]

    def test_frase_en_skill_cuenta_uno(self):
        r = scan({".claude/skills/x/SKILL.md": "Aplicá la Regla de Bolsillo siempre"}, frases=self.FR)
        self.assertEqual(r["frases_viejas"], 1)
        self.assertEqual(r["frases_viejas_por_frase"], {"regla de bolsillo": 1})

    def test_frase_en_claude_md_cuenta(self):
        self.assertEqual(scan({"CLAUDE.md": "la regla de bolsillo"}, frases=self.FR)["frases_viejas"], 1)

    def test_frase_en_md_de_docs_no_cuenta(self):
        r = scan({"docs/nota.md": "la regla de bolsillo", ".claude/skills/x/SKILL.md": "limpio"}, frases=self.FR)
        self.assertEqual(r["frases_viejas"], 0)

    def test_rutas_de_pc_dan_archivo_y_renglon_sin_texto(self):
        skill = "linea limpia\nabrí D:\\x\\algo\notra\nmirá /c/Users/x/cosa\n"
        r = scan({".claude/skills/x/SKILL.md": skill})
        self.assertEqual(r["rutas_absolutas"], 2)
        self.assertEqual(r["rutas_absolutas_en"], [{"archivo": ".claude/skills/x/SKILL.md", "renglon": 2},
                                                   {"archivo": ".claude/skills/x/SKILL.md", "renglon": 4}])
        salida = json.dumps(r, ensure_ascii=False)
        self.assertNotIn("D:\\x", salida)
        self.assertNotIn("Users/x", salida)

    def test_url_https_no_es_ruta(self):
        r = scan({".claude/skills/x/SKILL.md": "ver https://ejemplo.com/home/ y http://a.b/Users/x\n"})
        self.assertEqual(r["rutas_absolutas"], 0)

    def test_los_archivos_de_prueba_no_cuentan(self):
        r = scan({".claude/skills/x/SKILL.md": "limpio", ".claude/skills/skills.test.cjs": "mirá D:\\x"})
        self.assertEqual(r["rutas_absolutas"], 0)

    def test_ruta_en_docs_no_cuenta(self):
        self.assertEqual(scan({"docs/a.md": "C:\\Users\\yo"})["rutas_absolutas"], 0)

    def test_frases_sin_fuente_no_entran(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "f.txt")
            with open(p, "w", encoding="utf-8") as f:
                f.write("# comentario\ncon fuente\t# H §3\nsin fuente\nvacia\t# \n")
            self.assertEqual(flota.cargar_frases(p), ["con fuente"])

    def test_el_archivo_de_frases_real_carga_y_todas_tienen_fuente(self):
        frases = flota.cargar_frases()
        self.assertGreaterEqual(len(frases), 5)
        with open(flota.FRASES_POR_DEFECTO, encoding="utf-8") as f:
            crudo = [l for l in f if l.strip() and not l.startswith("#")]
        self.assertEqual(len(crudo), len(frases))

    def test_carpeta_local(self):
        with tempfile.TemporaryDirectory() as d:
            os.makedirs(os.path.join(d, "skills", "x"))
            with open(os.path.join(d, "skills", "x", "SKILL.md"), "w", encoding="utf-8") as f:
                f.write("regla de bolsillo\nC:\\u\n")
            with open(os.path.join(d, "CLAUDE.md"), "w", encoding="utf-8") as f:
                f.write("limpio")
            r = flota.medir_carpeta(d, self.FR)
            self.assertEqual((r["frases_viejas"], r["rutas_absolutas"], r["archivos_mirados"]), (1, 1, 2))


class Specs(unittest.TestCase):
    def test_spec_con_sello_cuenta_y_sin_sello_no(self):
        r = scan({"docs/SPEC-a.md": "# a\n" + SELLO, "docs/SPEC-b.md": "# b\nsin sello\n",
                  "docs/modulos/m/SPEC-c.md": SELLO, "docs/otro.md": SELLO})
        self.assertEqual(r["specs_total"], 3)
        self.assertEqual(r["specs_con_sello"], 2)


class Portada(unittest.TestCase):
    def test_enlace_a_norte(self):
        r = scan({"README.md": "Mirá el [norte](./docs/NORTE.md)."})
        self.assertTrue(r["portada"])
        self.assertTrue(r["portada_enlaza_norte"])

    def test_sin_enlace(self):
        r = scan({"readme.md": "Solo texto."})
        self.assertTrue(r["portada"])
        self.assertFalse(r["portada_enlaza_norte"])

    def test_sin_readme(self):
        self.assertFalse(scan({"docs/README.md": "no es la raíz"})["portada"])


class Handoff(unittest.TestCase):
    def test_tamanos(self):
        r = scan({"docs/SESSION_HANDOFF.md": "x" * 2048, "docs/TODO.md": "y" * 1024,
                  "docs/modulos/m/SESSION_HANDOFF.md": "z" * 512})
        self.assertEqual((r["handoff_kb"], r["todo_kb"]), (2.0, 1.0))
        self.assertEqual(r["handoff_modulos_kb"], {"m": 0.5})


class Hook(unittest.TestCase):
    def clon(self, script):
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d, True)
        os.makedirs(os.path.join(d, ".claude"))
        with open(os.path.join(d, "hook.py"), "w") as f:
            f.write(script)
        cmd = f'"{sys.executable}" hook.py'
        cfg = {"hooks": {"SessionStart": [{"hooks": [{"type": "command", "command": cmd}]}]}}
        with open(os.path.join(d, ".claude", "settings.json"), "w") as f:
            f.write(json.dumps(cfg))
        return d

    def test_hook_que_imprime_12000_caracteres(self):
        r = flota.huella_hook(self.clon("import sys\nsys.stdin.read()\nsys.stdout.write('x' * 12000)\n"))
        self.assertEqual(r["hook_chars"], 12000)
        self.assertTrue(r["hook_pasado_del_tope"])

    def test_project_dir_se_expande_en_las_tres_formas(self):
        clon = self.clon("import sys\nsys.stdout.write('y' * 7)\n")
        py = f'"{sys.executable}"'
        for cmd in (f'{py} $CLAUDE_PROJECT_DIR/hook.py', f'{py} "$CLAUDE_PROJECT_DIR/hook.py"',
                    f'{py} "${{CLAUDE_PROJECT_DIR}}/hook.py"'):
            with open(os.path.join(clon, ".claude", "settings.json"), "w") as f:
                f.write(json.dumps({"hooks": {"SessionStart": [{"hooks": [{"type": "command", "command": cmd}]}]}}))
            r = flota.huella_hook(clon)
            self.assertEqual(r["hook_chars"], 7, cmd)

    def test_expandir_proyecto_pone_comillas_solo_si_faltan(self):
        self.assertEqual(flota.expandir_proyecto('x "$CLAUDE_PROJECT_DIR"/a', "/c").count('""'), 0)
        self.assertTrue(flota.expandir_proyecto("x $CLAUDE_PROJECT_DIR/a", "/c").startswith('x "'))
        self.assertNotIn("CLAUDE_PROJECT_DIR", flota.expandir_proyecto("x ${CLAUDE_PROJECT_DIR}/a", "/c"))

    def test_hook_que_cuelga_da_null_al_plazo(self):
        t0 = time.time()
        r = flota.huella_hook(self.clon("import time\ntime.sleep(60)\n"), plazo=1)
        self.assertIsNone(r["hook_chars"])
        self.assertIn("plazo", r["hook_motivo"])
        self.assertLess(time.time() - t0, 15)

    def test_hook_que_falla_da_null_con_motivo(self):
        r = flota.huella_hook(self.clon("import sys\nsys.exit(3)\n"))
        self.assertIsNone(r["hook_chars"])
        self.assertIn("3", r["hook_motivo"])

    def test_sin_clon_da_null(self):
        self.assertIsNone(flota.huella_hook(None)["hook_chars"])
        self.assertIsNone(flota.huella_hook(os.path.join(tempfile.gettempdir(), "no-existe-xyz"))["hook_chars"])

    def test_correr_pone_hook_chars_en_la_fila_del_alias(self):
        clon = self.clon("import sys\nsys.stdout.write('y' * 50)\n")
        out = flota.correr(["o"], gh=fake_gh({"README.md": "x"}), node=fake_node, kit="/k", frases=[],
                           hooks={"r": clon}, plazo=20, lista_repos=[repo("r")])
        self.assertEqual(out["repos"][0]["hook_chars"], 50)
        self.assertNotIn("hooks_sin_fila", out)


class Cli(unittest.TestCase):
    def test_help_anda(self):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf), self.assertRaises(SystemExit) as cm:
            flota.main(["--help"])
        self.assertEqual(cm.exception.code, 0)
        self.assertIn("--carpeta", buf.getvalue())
        self.assertIn("--hook", buf.getvalue())


if __name__ == "__main__":
    unittest.main()
