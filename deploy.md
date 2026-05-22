# CROM New Tab - Guia de Deploy & Empacotamento de Produção

Este documento detalha o processo técnico de auditoria, empacotamento e publicação da extensão **CROM New Tab** em conformidade com os padrões SRE, de segurança e de revisão do ecossistema do Google Chrome (Manifest V3).

---

## 🛡️ 1. Checklist de Pré-Publicação (Auditoria de Segurança)

Antes de gerar o pacote de distribuição, execute as seguintes validações:

### A. Auditoria de CSP (Content Security Policy)
*   **Regra**: Nenhum recurso remoto (scripts, estilos ou fontes de terceiros) pode ser carregado pela extensão.
*   **Verificação**:
    1.  Abra a New Tab no navegador no modo desenvolvedor.
    2.  Pressione `F12` e vá para a aba **Console**.
    3.  Atualize a aba e certifique-se de que **não há erros de violação de CSP** (refusão de carregar scripts externos).
    4.  Valide que todas as dependências estão declaradas localmente no diretório (fontes baixadas, ícones inline, etc.).

### B. Conformidade com a Política de Propósito Único (Single Purpose Policy)
*   **Regra**: O Google exige que todas as extensões tenham um único propósito principal claramente definido.
*   **Verificação**: A extensão substitui exclusivamente a página de Nova Guia para fornecer um painel de controle (Dashboard) com utilitários de produtividade locais, alinhada estritamente com as políticas da Chrome Web Store.

---

## 📦 2. Empacotamento do Projeto (Produção)

O Chrome exige que a extensão seja empacotada em formato `.zip` compactado contendo apenas os arquivos de produção essenciais, eliminando logs, códigos de testes ou ferramentas de build temporárias.

### Passo 1: Limpeza do Diretório
Remova quaisquer arquivos temporários, scripts de build ou testes locais não necessários do diretório de produção:
```bash
# Exemplo de limpeza se houver scripts temporários
rm -f generate_icons.py
```

### Passo 2: Compactar os Arquivos Necessários
Compacte apenas os arquivos de runtime essenciais. No Linux, execute o seguinte comando no diretório raiz do projeto:

```bash
zip -r crom-newtab-production.zip manifest.json index.html css/ js/ assets/
```

> [!IMPORTANT]
> **Atenção**: Certifique-se de que o arquivo `manifest.json` está na raiz do arquivo `.zip` gerado, e não dentro de uma pasta intermediária, caso contrário o instalador do Chrome considerará o pacote inválido.

---

## 🚀 3. Processo de Publicação na Chrome Web Store

Siga estas etapas para publicar a extensão no painel de desenvolvedores do Google:

### Etapa 1: Acessar o Painel de Desenvolvedor
1.  Acesse o [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole).
2.  Faça login com a sua conta de desenvolvedor (há uma taxa única de registro cobrada pelo Google para novos desenvolvedores).

### Etapa 2: Criar um Novo Item
1.  No painel principal, clique no botão **+ Novo item** (+ New item).
2.  Uma caixa de diálogo será exibida solicitando o upload do arquivo compactado.
3.  Faça o upload do arquivo `crom-newtab-production.zip` criado na seção anterior.

### Etapa 3: Preencher os Detalhes da Extensão
1.  **Título**: CROM | Autonomia Técnica e Soberania Digital
2.  **Resumo**: Painel de Nova Guia de altíssimo nível focado em autonomia técnica e produtividade, contendo terminal interativo, buscador seguro, bloco de notas e atalhos customizados.
3.  **Categoria**: Produtividade / Ferramentas de Desenvolvedor.
4.  **Idiomas**: Adicione Português (Brasil) como idioma principal.
5.  **Imagens promocionais**: Envie imagens da interface Bento Grid (sugerido tirar capturas de tela do dashboard funcionando) nas resoluções exigidas pelo Google (1280x800 e ícones de 440x280).

### Etapa 4: Declarar Práticas de Privacidade (Data Privacy)
Como a extensão roda inteiramente de forma local (`localStorage` de notas e atalhos):
*   Declare que **a extensão não coleta, transmite ou armazena quaisquer dados pessoais dos usuários em servidores externos**. Todo o processamento ocorre no próprio navegador do usuário, o que simplifica drasticamente a revisão de segurança do Google e acelera a aprovação da extensão.

### Etapa 5: Enviar para Revisão
*   Clique em **Enviar para revisão** (Submit for review).
*   O processo de revisão costuma levar entre 24 horas e 3 dias úteis para extensões focadas em privacidade e sem permissões intrusivas.
