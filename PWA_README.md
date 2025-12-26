# Meevi PWA - Progressive Web App

O Meevi agora é um Progressive Web App (PWA) completo que pode ser instalado na tela inicial do seu dispositivo móvel ou desktop!

## 🎉 Recursos PWA

### ✅ Instalação na Tela Inicial
- **Android**: Instale o app diretamente do navegador Chrome/Edge
- **iOS**: Adicione à tela inicial via Safari (Compartilhar → Adicionar à Tela de Início)
- **Desktop**: Instale via Chrome, Edge ou outros navegadores compatíveis

### ✅ Funcionalidades Offline
- Cache inteligente de recursos estáticos
- Continua funcionando sem conexão (dados salvos localmente)
- Indicador visual de status de conexão
- Sincronização automática quando voltar online

### ✅ Experiência Nativa
- Ícone na tela inicial do dispositivo
- Tela de splash personalizada
- Barra de status integrada
- Navegação fluida sem barra de endereço
- Suporte a Safe Area (entalhes e notches)

### ✅ Notificações Push
- Lembretes de vacinação atrasada
- Alertas de alimentação
- Notificações de aniversário dos pets
- Central de notificações integrada

## 📱 Como Instalar

### Android (Chrome/Edge)
1. Acesse o Meevi no navegador
2. Toque no ícone de menu (⋮)
3. Selecione "Instalar app" ou "Adicionar à tela inicial"
4. Confirme a instalação
5. O app aparecerá na tela inicial

### iOS (Safari)
1. Abra o Meevi no Safari
2. Toque no botão de compartilhar (⬆)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Escolha um nome e confirme
5. O app aparecerá na tela inicial

### Desktop (Chrome/Edge)
1. Acesse o Meevi no navegador
2. Clique no ícone de instalação na barra de endereço
3. Ou vá em Menu → Instalar Meevi
4. O app será instalado como aplicativo desktop

## 🔧 Arquitetura Técnica

### Arquivos do PWA

```
public/
├── manifest.json          # Configuração do PWA
├── sw.js                  # Service Worker para cache
├── icon-192x192.jpg       # Ícone 192x192
└── icon-512x512.jpg       # Ícone 512x512

app/
├── layout.tsx             # Meta tags PWA
└── page.tsx               # Integração do PWAInstallPrompt

components/
├── pwa-install-prompt.tsx # Prompt de instalação
├── offline-indicator.tsx  # Indicador de status offline
└── notifications-center.tsx # Centro de notificações
```

### Service Worker

O Service Worker implementa a estratégia **Network First, Cache Fallback**:

- **Primeira tentativa**: Buscar da rede (sempre atualizado)
- **Fallback**: Se offline, usar cache
- **Cache**: Atualizado em background após sucesso de rede

### Estratégia de Cache

1. **Static Assets**: Ícones, logos, fontes (cache on install)
2. **Pages**: Páginas HTML (cache on fetch)
3. **API Calls**: Não são cacheadas (sempre da rede)
4. **Images**: Cacheadas após primeiro carregamento

## 🎨 Design Responsivo

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Safe Areas
- Suporte completo para iPhone X+ (notch)
- Suporte para Android com câmera punch-hole
- Padding automático para áreas seguras

## 📊 Performance

### Lighthouse Scores (Target)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+
- **PWA**: 100

### Otimizações
- Service Worker para cache offline
- Lazy loading de imagens
- Code splitting por rota
- Compressão de assets
- Cache de API responses

## 🔔 Notificações

### Tipos de Notificações
1. **Vacinação Atrasada**: Verifica idade do cachorro vs calendário de vacinas
2. **Lembretes de Alimentação**: Se passou 8+ horas sem registro
3. **Aniversário**: Notificação especial na data de nascimento
4. **Exercício Diário**: Motivação para registrar atividades

### Configuração
- Usuário pode habilitar/desabilitar por tipo
- Configurações salvas no Supabase
- Verificação automática a cada 15 minutos

## 🗄️ Armazenamento

### Supabase (Online)
- Dados de cachorros
- Histórico de alimentação, banho, exercício
- Vacinações e saúde
- Notificações
- Perfil do usuário

### Cache (Offline)
- Assets estáticos
- Páginas visitadas recentemente
- Imagens dos cachorros
- Últimas entradas do diário

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Deploy automático via Git
git push origin main

# Vercel faz build e deploy automaticamente
```

### Requisitos
- Node.js 18+
- Next.js 16+
- Supabase account
- Vercel Blob para uploads

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 90+ (Android/Desktop)
- ✅ Safari 15+ (iOS/macOS)
- ✅ Edge 90+ (Windows/Android)
- ✅ Firefox 88+ (Android/Desktop)
- ✅ Samsung Internet 15+

### Recursos por Plataforma

| Recurso | Android | iOS | Desktop |
|---------|---------|-----|---------|
| Instalação | ✅ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ⚠️ | ✅ |
| Background Sync | ✅ | ❌ | ✅ |
| Add to Home Screen | ✅ | ✅ | ✅ |

⚠️ = Suporte limitado
❌ = Não suportado pela plataforma

## 🐛 Troubleshooting

### App não aparece para instalação?
- Certifique-se de acessar via HTTPS
- Verifique se o manifest.json está acessível
- Limpe o cache do navegador
- Recarregue a página

### Service Worker não funciona?
- Abra DevTools → Application → Service Workers
- Clique em "Unregister" e recarregue
- Verifique se não há erros no console
- Service Workers requerem HTTPS (exceto localhost)

### Notificações não aparecem?
- Verifique permissões do navegador
- Habilite notificações nas configurações do app
- No iOS, notificações push têm suporte limitado

## 📝 Próximas Melhorias

- [ ] Background sync para sincronizar dados offline
- [ ] Share Target API (compartilhar fotos para o app)
- [ ] Web Share API (compartilhar do app para outros)
- [ ] App Shortcuts (atalhos na tela inicial)
- [ ] Periocdic Background Sync
- [ ] Contact Picker API
- [ ] File System Access API

## 📄 Licença

Meevi © 2025 - Todos os direitos reservados

---

**Desenvolvido com ❤️ para seu Spitz Alemão**
