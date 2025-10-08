# LeRunners - Plataforma de Gestão de Atletas

Bem-vindo à plataforma LeRunners! Este projeto foi desenvolvido para auxiliar na gestão de atletas e treinamentos, com integração Firebase para autenticação e armazenamento de dados, e Strava API para sincronização de atividades.

## Visão Geral das Funcionalidades

*   **Login de Usuários:** O auto-cadastro foi removido. Apenas usuários cadastrados (Administradores, Professores, Atletas) podem acessar a plataforma.
*   **Administrador Mestre:** Um usuário administrador com credenciais específicas para gerenciar toda a plataforma. Ele pode cadastrar outros usuários e gerenciar o conteúdo de conhecimento.
*   **Gestão de Usuários (Admin):** O administrador pode cadastrar novos professores e atletas, além de visualizar e gerenciar todos os usuários.
*   **Gestão de Atletas (Professor):** Professores podem cadastrar e gerenciar seus atletas, definir objetivos e acompanhar o progresso.
*   **Dashboard do Atleta:** Atletas podem visualizar suas atividades sincronizadas do Strava, acompanhar seus objetivos e acessar o conteúdo de conhecimento.
*   **Cérebro Inteligente (Base de Conhecimento):** O administrador pode fazer upload de arquivos (PDF, DOCX, TXT) com informações e dicas valiosas. Professores e atletas podem acessar este conteúdo.
*   **Integração Strava:** Sincronização de atividades de corrida e ciclismo diretamente do Strava.
*   **Assinatura:** Rodapé com "Desenvolvido com IA por thIAguinho Soluções".

## Credenciais Iniciais

Para o primeiro acesso como **Administrador Mestre**, utilize as seguintes credenciais:

*   **Email:** `admin@lerunners.com`
*   **Senha:** `admin123`

Após o login, o Administrador Mestre poderá cadastrar outros administradores, professores e atletas através do painel de gestão de usuários.

## Configuração do Projeto

Este projeto é uma **Single Page Application (SPA)** desenvolvida com HTML, CSS e JavaScript puros. Todas as configurações do Firebase e Strava API já estão inseridas no arquivo `js/config.js` com os valores reais que você forneceu.

### 1. Configuração do Firebase Authentication (Passo Crucial!)

Para que o sistema de login funcione, você **DEVE** ativar o método de autenticação por Email/Senha no console do Firebase:

1.  Acesse o [Console Firebase](https://console.firebase.google.com/) e selecione seu projeto (`lerunners-4725f`).
2.  No menu lateral esquerdo, vá em **"Build" > "Authentication"**.
3.  Clique na aba **"Sign-in method"**.
4.  Encontre a opção **"Email/Password"** e clique no ícone de lápis para editá-la.
5.  **Habilite** a opção "Email/Password" e clique em "Save".

### 2. Deploy no GitHub Pages

Siga estes passos para fazer o deploy da aplicação no GitHub Pages:

1.  **Descompacte** o arquivo `lerunners-app-completo.zip` (que será gerado com estas atualizações).
2.  **Crie um novo repositório** no GitHub (ex: `lerunners-app`).
3.  **Faça o upload de TODOS os arquivos e pastas** descompactados para este repositório.
4.  No GitHub, vá para as **Configurações do seu repositório > Pages**.
5.  Em "Source", selecione a branch `main` (ou a que você usou para o upload) e a pasta `/ (root)`. Salve.
6.  Aguarde alguns minutos. Sua aplicação estará online em `https://seu-usuario.github.io/lerunners-app`.

### 3. Configuração do Strava API (Após o Deploy)

Para que a integração com o Strava funcione corretamente, você precisará atualizar as configurações da sua aplicação Strava com a URL do seu GitHub Pages:

1.  Acesse [https://developers.strava.com/](https://developers.strava.com/) e faça login.
2.  Vá para "My API Application" e selecione sua aplicação.
3.  Atualize o campo **Website** para a URL completa do seu GitHub Pages (ex: `https://seu-usuario.github.io/lerunners-app`).
4.  Atualize o campo **Authorization Callback Domain** para **apenas o domínio** (ex: `seu-usuario.github.io`).
5.  Salve as alterações.

## Estrutura de Arquivos

*   `index.html`: O arquivo HTML principal da aplicação, com a nova estrutura de dashboards.
*   `css/styles.css`: Estilos CSS para toda a aplicação, incluindo os novos elementos.
*   `js/config.js`: Contém as configurações do Firebase, Strava e as credenciais do Administrador Mestre.
*   `js/auth.js`: Funções de autenticação (login, logout) e lógica para o Administrador Mestre.
*   `js/strava.js`: Funções para integração com a API do Strava.
*   `js/dashboard.js`: Lógica e funções para os dashboards de Atleta e Professor, incluindo acesso ao conhecimento.
*   `js/admin.js`: **NOVO ARQUIVO** - Lógica e funções para o dashboard do Administrador (gestão de usuários, upload de conhecimento).
*   `js/app.js`: Lógica principal da aplicação, inicialização e gerenciamento de eventos.

## Desenvolvimento

Este projeto foi desenvolvido para ser o mais leve e direto possível, utilizando apenas recursos de front-end e Firebase como backend. Não há necessidade de um servidor Node.js ou Python para o deploy, apenas um servidor de arquivos estáticos (como o GitHub Pages).

---

**Desenvolvido com IA por thIAguinho Soluções**

