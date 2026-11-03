"""Pruebas de huella.py: sin red, sin gh real (gh_file inyectado); git sobre un repo temporal.
Correr: py -3 -m unittest test_huella -v   (desde observatorio/investigacion)"""
import os, shutil, subprocess, tempfile, unittest

import huella

V2 = "---\nname: inicio\n---\nLeé el handoff y la memoria y confirmá en tres líneas dónde quedamos.\n"
V3 = "---\nname: inicio\n---\nLeé la ficha, el handoff con tope y el estado del módulo; confirmá en tres líneas.\n"


def git_repo(archivos):
    d = tempfile.mkdtemp()

    def run(*a):
        return subprocess.run(["git", "-C", d, "-c", "user.email=t@t", "-c", "user.name=t", *a],
                              capture_output=True, text=True, check=True)
    run("init", "-q")
    for ruta, txt in archivos.items():
        p = os.path.join(d, ruta)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8", newline="\n") as f:
            f.write(txt)
        run("add", ".")
        run("commit", "-q", "-m", ruta)
    return d


def flota_con(skills):
    return [{"repo": "o/r", "rama": "main", "skills": skills}]


class Huella(unittest.TestCase):
    def setUp(self):
        self.kit = git_repo({
            "kit/skills/arquitecto/templates/universales/skills/inicio/SKILL.md": V2,
            "kit/molde/skills/inicio/SKILL.md": V3})
        self.addCleanup(shutil.rmtree, self.kit, True)
        self.git = huella.git_en(self.kit)

    def correr(self, texto_proyecto, skills=("inicio",)):
        def gh(full, path, ref):
            return texto_proyecto if path.endswith("inicio/SKILL.md") else "mi skill"
        return huella.huella(flota_con(list(skills)), self.git, gh_file=gh)

    def test_ve_las_dos_historias(self):
        r = self.correr(V3)
        self.assertEqual({x.split()[0] for x in r["versiones_molde"]["inicio"]}, {"v2", "v3"})

    def test_proyecto_parecido_al_v3_elige_v3(self):
        i = self.correr(V3 + "extra\n")["proyectos"][0]["inicio"]
        self.assertEqual(i["historia"], "v3")
        self.assertGreater(i["parecido"], 0.9)

    def test_proyecto_parecido_al_v2_elige_v2(self):
        i = self.correr(V2)["proyectos"][0]["inicio"]
        self.assertEqual(i["historia"], "v2")
        self.assertEqual(i["parecido"], 1.0)

    def test_molde_solo_v2_no_rompe(self):
        kit = git_repo({"kit/skills/arquitecto/templates/universales/skills/inicio/SKILL.md": V2})
        self.addCleanup(shutil.rmtree, kit, True)
        r = huella.huella(flota_con(["inicio"]), huella.git_en(kit), gh_file=lambda *a: V2)
        self.assertEqual(r["proyectos"][0]["inicio"]["historia"], "v2")

    def test_molde_solo_v3_no_rompe(self):
        kit = git_repo({"kit/molde/skills/inicio/SKILL.md": V3})
        self.addCleanup(shutil.rmtree, kit, True)
        r = huella.huella(flota_con(["inicio"]), huella.git_en(kit), gh_file=lambda *a: V3)
        self.assertEqual(r["proyectos"][0]["inicio"]["historia"], "v3")

    def test_sin_molde_en_ninguna_ruta_no_rompe(self):
        kit = git_repo({"otra/cosa.md": "x"})
        self.addCleanup(shutil.rmtree, kit, True)
        r = huella.huella(flota_con(["inicio"]), huella.git_en(kit), gh_file=lambda *a: V2)
        self.assertIsNone(r["proyectos"][0]["inicio"]["parecido"])

    def test_ya_no_calcula_copias_del_kit_y_las_deja_fuera_de_propias(self):
        p = self.correr(V3, skills=("inicio", "arquitecto", "mia"))["proyectos"][0]
        self.assertNotIn("copias_del_kit", p)
        self.assertEqual(list(p["propias"]), ["mia"])

    def test_acepta_la_flota_como_lista_o_como_dict(self):
        def gh(*a):
            return V3
        a = huella.huella(flota_con(["inicio"]), self.git, gh_file=gh)
        b = huella.huella({"repos": flota_con(["inicio"]), "skills_propias": []}, self.git, gh_file=gh)
        self.assertEqual(a, b)


if __name__ == "__main__":
    unittest.main()
