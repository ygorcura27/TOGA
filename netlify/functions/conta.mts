// Contas simples (usuário e senha) para o save na nuvem. Senha guardada só como hash scrypt com sal; o login devolve um token de sessão.
import { getStore } from "@netlify/blobs"
import type { Config, Context } from "@netlify/functions"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const USUARIO = /^[a-z0-9_.]{3,20}$/
const hash = (senha: string, sal: string) => scryptSync(senha, sal, 64).toString("hex")

export default async (req: Request, context: Context) => {
  let b: any
  try { b = await req.json() } catch { return Response.json({ erro: "JSON inválido" }, { status: 400 }) }
  const usuario = String(b.usuario || "").trim().toLowerCase(), senha = String(b.senha || "")
  if (!USUARIO.test(usuario)) return Response.json({ erro: "Usuário deve ter de 3 a 20 caracteres: letras minúsculas, números, ponto ou _." }, { status: 400 })
  if (senha.length < 6 || senha.length > 100) return Response.json({ erro: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 })
  const contas = getStore({ name: "contas", consistency: "strong" }), sessoes = getStore({ name: "sessoes", consistency: "strong" })

  if (b.acao === "criar") {
    const sal = randomBytes(16).toString("hex")
    const { modified } = await contas.setJSON(usuario, { sal, hash: hash(senha, sal), criado: Date.now() }, { onlyIfNew: true })
    if (!modified) return Response.json({ erro: "Esse usuário já existe. Escolha outro ou entre com a senha." }, { status: 409 })
  } else if (b.acao === "entrar") {
    const c: any = await contas.get(usuario, { type: "json" })
    const ok = c && timingSafeEqual(Buffer.from(hash(senha, c.sal), "hex"), Buffer.from(c.hash, "hex"))
    if (!ok) return Response.json({ erro: "Usuário ou senha incorretos." }, { status: 401 })
  } else return Response.json({ erro: "ação inválida" }, { status: 400 })

  const token = randomBytes(32).toString("hex")
  await sessoes.setJSON(token, { usuario, criado: Date.now() })
  return Response.json({ token, usuario })
}

export const config: Config = {
  path: "/api/conta",
  method: ["POST"],
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
