'use strict';
// agente.cjs — PROVISORIA (encargo G5, misión 5 D3.1). La versión de verdad la escribe G3 en kit/molde/hooks/lib/agente.cjs; al
// integrar, el director pisa esta copia con aquella y corre pc/lib.test.cjs (la prueba anti-desvío, D-12). Cumple el mismo contrato:
//
//   sesionDeAgente(cwd) → { agente: bool, rol, rama, raiz, principal }
//     agente = rama de obrero (modulo/<x>--<ID>, contexto.pestana) O .kit-rol obrero / nocturno / desconocido (contexto.rol);
//              actualizador, director y humano no (SPEC-paquete-3 P4.7, "Sesión de agente").
//     principal = la carpeta que contiene el git-common-dir (la raíz del checkout principal).
//     Sin repo: { agente: false }.
// Node estándar, cero dependencias. Es .cjs a propósito: corre igual en proyectos con "type": "module".

const path = require('path');
const contexto = require('./contexto.cjs');

const ROLES_DE_AGENTE = ['obrero', 'nocturno', 'desconocido'];

function sesionDeAgente(cwd = process.cwd()) {
  const g = contexto.datosGit(cwd);
  if (!g) return { agente: false };
  const rol = contexto.rol(g.raiz);
  const rama = contexto.rama(g.raiz);
  const obrero = contexto.pestana(rama).tipo === 'obrero';
  return {
    agente: obrero || ROLES_DE_AGENTE.includes(rol),
    rol,
    rama,
    raiz: g.raiz,
    principal: path.dirname(g.gitComun),
  };
}

module.exports = { ROLES_DE_AGENTE, sesionDeAgente };
