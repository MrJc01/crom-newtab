# CROM | Chrome New Tab Extension

> **Autonomia Técnica e Soberania Digital diretamente na sua página de Nova Guia.**

A **CROM New Tab** é uma extensão para o Google Chrome (construída sob as especificações do **Manifest V3**) que substitui a tela padrão de "Nova Guia" por um painel de controle (Dashboard) em estilo **Bento Grid**, focado em privacidade, produtividade e utilitários de desenvolvimento.

Este projeto é totalmente independente de redes externas (**100% offline-ready**), eliminando latências e bloqueios de Content Security Policy (CSP) ao carregar scripts ou dependências de terceiros.

---

## 🎨 Design & Estética Premium

Inspirado na identidade oficial do ecossistema [CROM](https://crom.run):
*   **Dark Mode Nativo**: Fundo Slate profundo (`#09090b` / `#0f172a`).
*   **Glows Ambientais**: Gradientes neon azuis sutis no plano de fundo.
*   **Glassmorphism**: Painéis e cards translúcidos utilizando `backdrop-filter: blur(24px)` e bordas de opacidade reduzida.
*   **Tipografia Híbrida**: `JetBrains Mono` para terminais, relógios e logs; `Plus Jakarta Sans` e `Space Grotesk` para títulos e navegação.
*   **Micro-interações**: Efeitos de elevação 3D suave e acentuação de glows azuis neon nos cards ao pairar o mouse.

---

## ⚙️ Funcionalidades Integradas

1.  **Relógio Cyborg & Data**: Relógio de alta precisão em formato digital (`HH:MM:SS`) e exibição de data por extenso em português.
2.  **Busca Multi-Foco**: Barra de pesquisa rápida que permite alternar dinamicamente entre motores de busca:
    *   **Google** (Busca geral)
    *   **DuckDuckGo** (Busca com privacidade)
    *   **GitHub** (Busca de repositórios de código)
    *   **StackOverflow** (Busca de soluções técnicas)
3.  **Terminal de Autonomia (Sovereign Shell)**: Simulador interativo de linha de comando no estilo console de SRE, permitindo executar comandos que respondem com filosofias de soberania e logs de sistema fictícios.
4.  **Quick Notes**: Bloco de notas simples integrado com auto-salvamento automático *debounced* (salva no `localStorage` local 600ms após parar de digitar, evitando engasgos de CPU).
5.  **Atalhos Rápidos Customizáveis**: Gerenciador dinâmico de links que permite adicionar e remover atalhos de navegação customizados com paletas de cores dinâmicas no ícone.
6.  **Sovereignty Logs**: Alimentador contínuo de logs de sistema simulando atualizações de compilação, Docker e chaves GPG, conferindo dinamismo visual ao dashboard.
7.  **Filosofia Rotativa CROM**: Exibição de citações e máximas inspiradoras sobre software livre e autonomia técnica rotacionadas a cada 30 segundos.

---

## 📂 Estrutura do Projeto

```
crom-newtab/
├── manifest.json         # Configurações da Extensão do Chrome (Manifest V3)
├── index.html            # Estrutura do Dashboard Bento Grid e SVGs locais
├── css/
│   └── styles.css        # Folha de estilo Vanilla Premium com variáveis e efeitos
├── js/
│   └── app.js            # Lógica computacional, terminal, relógio e persistência
└── assets/
    └── icons/            # Ícones locais da extensão em PNG
        ├── icon-16.png
        ├── icon-48.png
        └── icon-128.png
```

---

## 🧪 Como Testar e Instalar Localmente

Siga o guia passo a passo para carregar e experimentar a extensão no seu ambiente local:

### Passo 1: Preparar o Repositório
Certifique-se de que todos os arquivos estejam no mesmo diretório local do seu computador:
`/home/j/Área de trabalho/GitHub/crom-newtab/`

### Passo 2: Acessar a Página de Extensões do Chrome
1. Abra o navegador **Google Chrome**.
2. Na barra de endereços, digite `chrome://extensions/` e pressione **Enter**.

### Passo 3: Ativar o Modo do Desenvolvedor
No canto superior direito da página de extensões, ative a chave seletora **Modo do desenvolvedor** (Developer mode).

### Passo 4: Carregar a Extensão Local
1. No canto superior esquerdo, clique no botão **Carregar sem compactação** (Load unpacked).
2. Na janela de seleção de arquivos, selecione a pasta raiz do projeto: `/home/j/Área de trabalho/GitHub/crom-newtab/` e clique em **Abrir/Selecionar**.

### Passo 5: Testar a Nova Guia
1. Abra uma nova guia pressionando **Ctrl + T** (ou clicando no botão "+" de nova aba).
2. O Google Chrome exibirá a sua nova página de Nova Guia estilizada.
3. **Importante**: O Chrome exibirá um alerta de segurança perguntando se você deseja manter a alteração. Clique em **Manter alterações** (Keep changes) para aprovar o funcionamento permanente.

---

## 💻 Comandos Suportados no Terminal CROM

Clique na área do painel do terminal para focá-lo e experimente digitar os seguintes comandos seguidos de **Enter**:

*   `help` - Exibe o sumário de comandos disponíveis de soberania.
*   `about` - Apresenta a visão institucional da CROM.
*   `mutunicismo` - Explica a lógica econômica e técnica do mutunicismo cooperativo.
*   `soberania` - Lista os 5 pilares fundamentais do desenvolvedor soberano.
*   `system` - Exibe estatísticas de memória, rede e integridade SRE da infraestrutura virtual.
*   `links` - Atalhos rápidos para desenvolvedores.
*   `clear` - Limpa a tela do terminal.

---

## 🛡️ Licença e Soberania
Desenvolvido com foco em **Autonomia Técnica e Soberania Digital**. Código aberto livre para modificações locais e auto-hospedagem.
