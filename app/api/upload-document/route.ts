import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const dogId = formData.get("dogId") as string
    const documentType = formData.get("documentType") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo foi enviado" }, { status: 400 })
    }

    if (!dogId) {
      return NextResponse.json({ error: "ID do cachorro não foi fornecido" }, { status: 400 })
    }

    // Validate file type (images and PDFs)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "O arquivo deve ser uma imagem (JPG, PNG, WebP, HEIC) ou PDF" },
        { status: 400 }
      )
    }

    // Validate file size (10MB max for documents)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "O arquivo deve ter no máximo 10MB" }, { status: 400 })
    }

    // Upload to Vercel Blob with a unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `documents/dog-${dogId}-${documentType}-${timestamp}.${extension}`
    
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("[v0] Document uploaded successfully:", blob.url)

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
        error: "Falha no upload do documento",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
