import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const dogId = formData.get("dogId") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo foi enviado" }, { status: 400 })
    }

    if (!dogId) {
      return NextResponse.json({ error: "ID do cachorro não foi fornecido" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "O arquivo deve ser uma imagem" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "A imagem deve ter no máximo 5MB" }, { status: 400 })
    }

    // Upload to Vercel Blob with a unique filename
    const filename = `dog-${dogId}-${Date.now()}.${file.name.split(".").pop()}`
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("[v0] Dog photo uploaded successfully:", blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao fazer upload"
    return NextResponse.json(
      {
        success: false,
        error: "Falha no upload da foto",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
