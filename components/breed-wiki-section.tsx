"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dog,
  Heart,
  Ruler,
  Calendar,
  Brain,
  Activity,
  Home,
  Users,
  AlertCircle,
  ChevronRight,
  Search,
  ArrowLeft,
  Palette,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface BreedInfo {
  id: string
  category: string
  icon: any
  title: string
  content: string[]
  tips?: string[]
}

const breedData: BreedInfo[] = [
  {
    id: "origin",
    category: "História",
    icon: Calendar,
    title: "Origem e História",
    content: [
      "O Spitz Alemão é uma das raças mais antigas da Europa Central, descendente direto dos cães da Idade da Pedra.",
      "Eram muito populares na Pomerânia (região entre Alemanha e Polônia), sendo criados em diferentes tamanhos.",
      "No século XVIII, a rainha Charlotte da Inglaterra trouxe exemplares maiores para a Inglaterra, onde foram refinados.",
      "A raça foi oficialmente reconhecida pela FCI (Federação Cinológica Internacional) e é dividida em 5 variedades por tamanho.",
    ],
  },
  {
    id: "types",
    category: "Tipos e Tamanhos",
    icon: Ruler,
    title: "Variedades do Spitz Alemão",
    content: [
      "O Spitz Alemão é dividido em 3 variedades principais baseadas na altura:",
      "Spitz Alemão Anão (Zwergspitz/Lulu da Pomerânia): 18 cm a 22 cm de altura",
      "Spitz Alemão Pequeno (Kleinspitz): 23 cm a 29 cm de altura",
      "Spitz Alemão Médio (Mittelspitz): 30 cm a 38 cm de altura",
      "Cada variedade mantém as mesmas características de temperamento e aparência, diferindo apenas no tamanho.",
    ],
    tips: [
      "A altura é medida na cernelha (ponto mais alto do ombro)",
      "O peso varia proporcionalmente ao tamanho",
      "Todas as variedades são reconhecidas pela FCI",
    ],
  },
  {
    id: "colors",
    category: "Cores",
    icon: Palette,
    title: "Cores do Spitz Alemão",
    content: [
      "O Spitz Alemão apresenta uma ampla variedade de cores reconhecidas:",
      "Cores sólidas: Branco puro, Preto puro, Marrom (chocolate), Laranja (orange), Creme",
      "Cinza-lobo (wolf sable): Pelagem prateada com pontas pretas",
      "Outras cores: Creme-sable, laranja-sable, preto e castanho, e particolor (branco com manchas)",
      "A cor da pelagem não afeta o temperamento ou saúde do cão.",
    ],
    tips: [
      "Filhotes podem mudar de cor até 1 ano de idade",
      "Cores mais raras podem ter preços mais elevados",
      "Todas as cores são igualmente saudáveis",
    ],
  },
  {
    id: "coat-change",
    category: "Pelagem",
    icon: Sparkles,
    title: "Troca de Pelo",
    content: [
      "O Spitz Alemão passa por uma mudança significativa de pelagem durante seu desenvolvimento.",
      "Idade da troca de pelo: Entre 4 e 10 meses de idade, o filhote troca o pelo de bebê pela pelagem adulta.",
      "Durante esse período, o cão pode parecer 'feio' ou 'pelado', com áreas irregulares - isso é completamente normal.",
      "A pelagem adulta completa se desenvolve até aproximadamente 2-3 anos de idade.",
      "Após a maturidade, ocorrem duas trocas anuais: uma na primavera e outra no outono.",
    ],
    tips: [
      "Escove diariamente durante a troca para remover pelos mortos",
      "Não se preocupe com a aparência temporária durante a troca",
      "A pelagem adulta será mais densa e bela que a de filhote",
      "Banhos podem ajudar a soltar os pelos mortos",
    ],
  },
  {
    id: "appearance",
    category: "Aparência",
    icon: Dog,
    title: "Características Físicas",
    content: [
      "Pelagem dupla extremamente densa: subpelo macio e pelo de cobertura longo e reto",
      "Cauda enrolada sobre o dorso, característica marcante da raça",
      "Focinho pequeno em proporção ao crânio, orelhas triangulares eretas",
      "Cores aceitas: branco, preto, marrom, laranja, cinza-lobo e outras cores",
    ],
    tips: ["Peso: 4-7 kg (variedade pequena)", "Altura: 23-29 cm (cernelha)", "Expectativa de vida: 12-16 anos"],
  },
  {
    id: "reproduction",
    category: "Reprodução",
    icon: Heart,
    title: "Reprodução e Acasalamento",
    content: [
      "Primeiro cio das fêmeas: Geralmente ocorre entre 6 e 12 meses de idade.",
      "IMPORTANTE: Não cruze no primeiro cio! O organismo da fêmea ainda não está completamente preparado para gestação.",
      "Idade ideal para primeira cruza (fêmeas): A partir do segundo ou terceiro cio, geralmente aos 18-24 meses.",
      "Machos prontos para cruzar: Atingem maturidade sexual entre 12 e 18 meses, mas o ideal é aguardar até 18-24 meses.",
      "Fêmeas entram no cio aproximadamente a cada 6 meses.",
      "Gestação dura cerca de 63 dias, com ninhadas de 1 a 5 filhotes.",
    ],
    tips: [
      "Consulte sempre um veterinário antes de cruzar",
      "Certifique-se que ambos os pais têm exames de saúde em dia",
      "Cruza precoce pode causar problemas de saúde permanentes",
      "Considere a responsabilidade de criar filhotes antes de cruzar",
    ],
  },
  {
    id: "temperament",
    category: "Temperamento",
    icon: Heart,
    title: "Personalidade",
    content: [
      "Extremamente alegre, vivaz e afetuoso com a família",
      "Muito alerta e desconfiado com estranhos, excelente cão de guarda",
      "Inteligente e facilmente treinável, mas pode ser teimoso",
      "Late bastante - necessita treinamento desde filhote para controlar latidos",
      "Ótimo com crianças quando socializado corretamente",
    ],
    tips: [
      "Requer socialização precoce",
      "Pode desenvolver 'síndrome do cão pequeno' se mimado demais",
      "Adora ser centro das atenções",
    ],
  },
  {
    id: "intelligence",
    category: "Inteligência",
    icon: Brain,
    title: "Capacidade de Aprendizado",
    content: [
      "Classificado entre as raças mais inteligentes para obediência e trabalho",
      "Aprende comandos rapidamente com 5-15 repetições",
      "Responde bem a métodos de treinamento com reforço positivo",
      "Pode ser independente e teimoso, requer consistência",
      "Excelente memória para truques e comandos",
    ],
    tips: ["Comece o treinamento cedo", "Use petiscos e elogios", "Sessões curtas (10-15 min) são mais eficazes"],
  },
  {
    id: "exercise",
    category: "Exercício",
    icon: Activity,
    title: "Necessidades de Atividade",
    content: [
      "Nível de energia médio a alto, apesar do tamanho pequeno",
      "Requer 30-60 minutos de exercício diário",
      "Adora passeios, brincadeiras e atividades mentais",
      "Adapta-se bem a apartamentos se exercitado adequadamente",
      "Jogos de buscar, esconder petiscos e brinquedos interativos são ideais",
    ],
    tips: [
      "2-3 passeios diários",
      "Não force exercícios em dias muito quentes",
      "Estimulação mental é tão importante quanto física",
    ],
  },
  {
    id: "living",
    category: "Convivência",
    icon: Home,
    title: "Adaptação ao Lar",
    content: [
      "Adapta-se muito bem a apartamentos e espaços pequenos",
      "Prefere estar sempre perto da família, não gosta de ficar sozinho",
      "Pode desenvolver ansiedade de separação se deixado sozinho por longos períodos",
      "Late para alertar sobre qualquer movimento ou som - pode ser desafiador em condomínios",
      "Tolera melhor o frio do que o calor devido à pelagem dupla",
    ],
    tips: [
      "Crie uma rotina consistente",
      "Forneça brinquedos para momentos sozinho",
      "Considere ar-condicionado no verão",
    ],
  },
  {
    id: "family",
    category: "Família",
    icon: Users,
    title: "Convívio Familiar",
    content: [
      "Excelente companheiro para famílias, solteiros e idosos",
      "Bom com crianças respeitosas, mas pode não tolerar manuseio brusco",
      "Pode ser territorial e ciumento se não socializado",
      "Geralmente convive bem com outros pets se apresentado gradualmente",
      "Muito leal e devoto à família, forma vínculos fortes",
    ],
    tips: [
      "Supervisione interações com crianças pequenas",
      "Socialize desde filhote com outros animais",
      "Ensine limites para evitar comportamento possessivo",
    ],
  },
  {
    id: "health",
    category: "Saúde",
    icon: AlertCircle,
    title: "Cuidados com a Saúde",
    content: [
      "Problemas comuns: luxação patelar, colapso de traqueia, problemas dentários",
      "Tendência a ganhar peso - controle alimentação e exercícios",
      "Sensível a altas temperaturas devido à pelagem densa",
      "Pode desenvolver alergias de pele - atenção à alimentação",
      "Exames regulares e cuidados preventivos são essenciais",
    ],
    tips: [
      "Check-up veterinário a cada 6-12 meses",
      "Escovação dentária regular",
      "Monitore peso constantemente",
      "Proteja do calor excessivo",
    ],
  },
]

export function BreedWikiSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const filteredData = breedData.filter(
    (item) =>
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Central da Raça</h1>
              <p className="text-sm text-muted-foreground">Tudo sobre o Spitz Alemão</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar informações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-24 h-24 bg-card rounded-full mx-auto mb-4 overflow-hidden">
            <img src="/spitz-breed.jpg" alt="Spitz Alemão" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Spitz Alemão</h2>
          <p className="text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
            Uma das raças mais antigas e encantadoras da Europa, conhecida por sua pelagem exuberante, personalidade
            vivaz e lealdade incomparável.
          </p>
        </div>
      </div>

      {/* Content Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resultado</h3>
            <p className="text-muted-foreground text-sm">Tente buscar com outros termos</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-bold mt-1">{item.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-3 ml-13">
                    {item.content.map((paragraph, idx) => (
                      <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}

                    {item.tips && item.tips.length > 0 && (
                      <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Dicas</p>
                        <ul className="space-y-1">
                          {item.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Facts */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-0">
          <h3 className="font-bold mb-4 text-center">Ficha Rápida</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Altura</p>
              <p className="text-sm font-semibold">23-29 cm</p>
            </div>
            <div className="text-center">
              <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Peso</p>
              <p className="text-sm font-semibold">4-7 kg</p>
            </div>
            <div className="text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Expectativa</p>
              <p className="text-sm font-semibold">12-16 anos</p>
            </div>
            <div className="text-center">
              <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Energia</p>
              <p className="text-sm font-semibold">Média-Alta</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
