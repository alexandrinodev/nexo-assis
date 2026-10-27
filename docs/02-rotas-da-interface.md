# Rotas da interface

- `/`: primeira rota de acesso, com a tela de login.
- `/chat`: tela de conversa do usuário comum, com dados de demonstração.
- `/admin`: console dos atendentes, com conversas e chamados de demonstração.

O grupo `(auth)` contém a página de entrada. O grupo `(workspace)` contém
as áreas de atendimento. Esses grupos organizam os arquivos e não aparecem
nas URLs. O layout raiz mantém apenas fontes, idioma, metadados padrão e
estilos globais; a apresentação do login fica em `components/features/auth`, com
classes utilitárias do Tailwind nos componentes.

A tela `/chat` apresenta uma conversa ilustrativa e permite selecionar afetados,
editar, confirmar ou cancelar um rascunho e enviar mensagens em estado local.
Não há criação real de chamados nem respostas de IA. O contador começa em 18,
como no layout de referência, e bloqueia novos envios ao chegar a 30. O perfil,
o status online e os horários também são demonstrativos. Recarregar a página
restaura a demonstração.

A tela `/admin` contém lista pesquisável de conversas, filtros, histórico e
painel de chamados do cliente selecionado. Permite assumir um atendimento,
enviar respostas locais, devolver ao agent ou encerrar mediante confirmação.
O campo de resposta só fica disponível depois de assumir. Dados de cada conversa
permanecem separados durante a navegação. As alterações são demonstrativas,
em memória, e não modificam chamados no servidor. Recarregar restaura os exemplos.

Ainda não há autenticação, sessão ou controle de acesso, e as rotas podem ser abertas diretamente.
O formulário de login ainda não redireciona nem valida credenciais no servidor.

Quando a autenticação for implementada, o servidor deve obter o perfil da sessão
validada e encaminhar usuários comuns para `/chat` e técnicos para `/admin`.
O acesso às páginas e às operações do servidor deverá verificar a sessão e o
perfil autorizado; o endereço da rota sozinho não protege os dados.
