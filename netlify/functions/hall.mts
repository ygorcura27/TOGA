// Hall da Fama global: cada vida encerrada vira uma entrada própria (sem read-modify-write); a leitura ordena por pontos.
import { getStore } from "@netlify/blobs"
import type { Config, Context } from "@netlify/functions"

const txt = (v: unknown, n: number) => String(v ?? "").slice(0, n)
const int = (v: unknown, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)))

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "hall" })
  if (req.method === "POST") {
    let v: any
    try { v = await req.json() } catch { return Response.json({ erro: "JSON inválido" }, { status: 400 }) }
    const e = {
      nome: txt(v.nome, 40), geracao: int(v.geracao, 1, 99), carreira: txt(v.carreira, 60), resumo: txt(v.resumo, 120),
      idade: int(v.idade, 18, 120), prest: int(v.prest, 0, 100), patrimonio: int(v.patrimonio, -1e9, 1e11), conq: int(v.conq, 0, 200),
      pontos: int(v.pontos, 0, 5000), motivo: txt(v.motivo, 20), data: new Date().toISOString().slice(0, 10), jogador: txt(v.jogador, 10),
    }
    if (!e.nome) return Response.json({ erro: "nome obrigatório" }, { status: 400 })
    const chave = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    await store.setJSON(chave, e)
    return Response.json({ ok: true })
  }
  if (req.method === "GET") {
    const { blobs } = await store.list()
    const recentes = blobs.map(b => b.key).sort().slice(-500)
    const vidas = (await Promise.all(recentes.map(k => store.get(k, { type: "json" })))).filter(Boolean) as any[]
    vidas.sort((a, b) => b.pontos - a.pontos)
    return Response.json(vidas.slice(0, 20), { headers: { "cache-control": "public, max-age=30" } })
  }
  return new Response("Método não permitido", { status: 405 })
}

export const config: Config = {
  path: "/api/hall",
  method: ["GET", "POST"],
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
