// Save na nuvem por código: o código (16 caracteres aleatórios) funciona como chave secreta do jogador.
import { getStore } from "@netlify/blobs"
import type { Config, Context } from "@netlify/functions"

const COD = /^[A-Z0-9]{16}$/
const MAX = 900_000 // bytes do save serializado

export default async (req: Request, context: Context) => {
  const url = new URL(req.url)
  const codigo = (url.searchParams.get("codigo") || "").toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (!COD.test(codigo)) return Response.json({ erro: "código inválido" }, { status: 400 })
  const store = getStore({ name: "saves", consistency: "strong" })

  if (req.method === "GET") {
    const s = await store.get(codigo, { type: "json" })
    if (!s) return Response.json({ erro: "nenhum jogo salvo com esse código" }, { status: 404 })
    return Response.json(s)
  }
  if (req.method === "PUT") {
    const txt = await req.text()
    if (txt.length > MAX) return Response.json({ erro: "save grande demais" }, { status: 413 })
    let corpo: any
    try { corpo = JSON.parse(txt) } catch { return Response.json({ erro: "JSON inválido" }, { status: 400 }) }
    if (typeof corpo?.data !== "string") return Response.json({ erro: "formato inválido" }, { status: 400 })
    await store.setJSON(codigo, { data: corpo.data, nome: String(corpo.nome || "").slice(0, 40), semana: Number(corpo.semana) || 0, salvoEm: Number(corpo.salvoEm) || Date.now(), atualizado: Date.now() })
    return Response.json({ ok: true })
  }
  if (req.method === "DELETE") { await store.delete(codigo); return Response.json({ ok: true }) }
  return new Response("Método não permitido", { status: 405 })
}

export const config: Config = {
  path: "/api/save",
  method: ["GET", "PUT", "DELETE"],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
