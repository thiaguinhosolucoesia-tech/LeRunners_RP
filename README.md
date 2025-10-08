LeRunners - Plataforma de Gestão de Atletas
​Bem-vindo à plataforma LeRunners! Este projeto foi desenvolvido para auxiliar na gestão de atletas e treinamentos, com integração Firebase para autenticação e armazenamento de dados, e Strava API para sincronização de atividades.
​🚨 AVISO DE SEGURANÇA CRÍTICO 🚨
​NÃO UTILIZE ESTE PROJETO EM PRODUÇÃO SEM ANTES CORRIGIR AS SEGUINTES VULNERABILIDADES:
​Chaves de API Expostas (js/config.js):
​As credenciais do Firebase (FIREBASE_CONFIG) e do Strava (STRAVA_CONFIG) estão expostas no código do cliente. Isso permite que qualquer pessoa com acesso ao código utilize suas chaves, podendo gerar custos e comprometer a segurança dos dados.
​Solução: Mova a lógica que utiliza chaves secretas (como o client_secret do Strava) para um backend (servidor). O frontend deve apenas se comunicar com seu backend, que por sua vez se comunica com as APIs externas. As chaves devem ser armazenadas como variáveis de ambiente no servidor.
​client_secret do Strava no Frontend (js/strava.js):
​A troca do código de autorização pelo token de acesso, que utiliza o client_secret, NUNCA deve ser feita no lado do cliente. Isso expõe sua "senha" da aplicação Strava.
​Solução (Implementada conceitualmente): A função exchangeCodeForToken foi modificada para apontar para um endpoint de backend hipotético (/api/strava/token). Você precisará criar este backend para lidar com a troca de tokens de forma segura.
​Credenciais de Administrador Hardcoded (js/config.js):
​As credenciais do administrador mestre estão visíveis no código.
​Solução: Para o primeiro acesso, considere um script de setup seguro ou um processo de registro inicial que delete ou desative essas credenciais após o uso.
​Visão Geral das Funcionalidades
​Login de Usuários: Apenas usuários cadastrados (Administradores, Professores, Atletas) podem acessar.
​Perfis de Acesso: Dashboards distintos para Administrador, Professor e Atleta.
​Gestão de Usuários (Admin): O administrador pode cadastrar e gerenciar professores e atletas.
​Gestão de Atletas (Professor): Professores podem gerenciar seus atletas e definir objetivos.
​Dashboard do Atleta: Atletas podem conectar-se ao Strava, visualizar atividades e metas.
​Cérebro Inteligente (Base de Conhecimento): Upload e acesso a documentos (PDF, DOCX, etc.).
​Integração Strava: Sincronização de atividades.
​Credenciais Iniciais
​Para o primeiro acesso como Administrador Mestre, utilize as credenciais em js/config.js.
​Email: admin@lerunners.com
​Senha: admin123
​Correções e Melhorias Implementadas
​Erro de Login Corrigido: O problema principal, que impedia o login, era a ordem incorreta de carregamento dos scripts no index.html. O app.js, responsável por inicializar o Firebase, era carregado por último. A ordem foi ajustada para garantir que o Firebase seja inicializado antes que qualquer outro script tente usá-lo.
​Segurança da API Strava: A lógica de troca de token foi reestruturada para demonstrar a abordagem correta via backend, prevenindo a exposição do client_secret.
​Melhora na UX: Os confirm() e alert() nativos, que são bloqueantes, foram substituídos por um modal de confirmação não bloqueante, melhorando a experiência do usuário.
​Configuração do Projeto
​1. Firebase (Autenticação)
​Você DEVE ativar o método de autenticação por Email/Senha no console do Firebase:
​Acesse o Console Firebase e selecione seu projeto (lerunners-4725f).
​No menu, vá em "Build" > "Authentication".
​Clique na aba "Sign-in method".
​Habilite a opção "Email/Password".
​2. Deploy (Ex: GitHub Pages)
​Faça o deploy dos arquivos em um serviço de hospedagem de sites estáticos.
​Após o deploy, atualize as configurações da sua aplicação Strava com a URL final.
​3. Strava API (Após o Deploy)
​Acesse https://developers.strava.com/ e vá para "My API Application".
​Atualize o campo Website para a URL da sua aplicação (ex: https://seu-usuario.github.io/lerunners-app).
​Atualize o campo Authorization Callback Domain para o domínio (ex: seu-usuario.github.io).
​Desenvolvido com IA por thIAguinho Soluções