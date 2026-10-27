import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import TechnicianWorkspace from './technician-workspace'

describe('TechnicianWorkspace', () => {
  it('bloqueia respostas antes de assumir e permite enviar uma mensagem após assumir', async () => {
    const user = userEvent.setup()
    render(<TechnicianWorkspace />)
    const composer = screen.getByRole('textbox', {
      name: 'Mensagem para Ana Souza',
    })
    expect(composer).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: 'Assumir atendimento' }),
    )
    expect(composer).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'O agent permanece pausado.',
    )
    const tickets = screen.getByRole('complementary', {
      name: 'Chamados do cliente',
    })
    expect(within(tickets).getByText('Assumido por Rafael Lima')).toBeVisible()
    expect(within(tickets).getByText('Em atendimento')).toBeVisible()

    await user.clear(composer)
    await user.type(composer, 'Vou verificar sua conexão agora.{Enter}')
    expect(
      within(screen.getByRole('log')).getByText(
        'Vou verificar sua conexão agora.',
        { exact: false },
      ),
    ).toBeVisible()
    expect(composer).toHaveValue('')
    expect(
      screen.getByRole('button', { name: 'Enviar mensagem' }),
    ).toBeDisabled()
  })

  it('devolve a conversa ao agent e bloqueia o envio do técnico', async () => {
    const user = userEvent.setup()
    render(<TechnicianWorkspace />)
    await user.click(
      screen.getByRole('button', { name: 'Assumir atendimento' }),
    )
    await user.click(
      screen.getAllByRole('button', { name: 'Devolver ao agent' })[0],
    )

    expect(
      screen.getByRole('textbox', { name: 'Mensagem para Ana Souza' }),
    ).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Conversa devolvida ao agent nesta prévia.',
    )
    expect(
      screen.getByRole('button', { name: 'Assumir atendimento' }),
    ).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /Minhas/ }))
    expect(screen.getByText('Nenhuma conversa encontrada.')).toBeVisible()
  })

  it('exige confirmação para encerrar e atualiza os chamados e o envio', async () => {
    const user = userEvent.setup()
    render(<TechnicianWorkspace />)
    await user.click(
      screen.getByRole('button', { name: 'Assumir atendimento' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Encerrar atendimento' }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Encerrar o atendimento de Ana Souza?',
    )
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(
      screen.getByRole('textbox', { name: 'Mensagem para Ana Souza' }),
    ).toBeEnabled()
    await user.click(
      screen.getByRole('button', { name: 'Encerrar atendimento' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar encerramento' }),
    )

    expect(
      screen.getByRole('textbox', { name: 'Mensagem para Ana Souza' }),
    ).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhum chamado foi alterado no servidor.',
    )
    const tickets = screen.getByRole('complementary', {
      name: 'Chamados do cliente',
    })
    expect(within(tickets).getByText('2 abertos · 3 encerrados')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Assumir atendimento' }),
    ).not.toBeInTheDocument()
  })

  it('pesquisa pelo chamado e troca o cliente com seus próprios dados', async () => {
    const user = userEvent.setup()
    render(<TechnicianWorkspace />)
    const list = screen.getByRole('complementary', {
      name: 'Lista de conversas',
    })
    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar conversa ou chamado' }),
      'INC-20318',
    )
    expect(within(list).queryByText('Ana Souza')).not.toBeInTheDocument()
    await user.click(within(list).getByRole('button', { name: /Carla Mendes/ }))
    expect(
      screen.getByRole('region', { name: 'Conversa com Carla Mendes' }),
    ).toBeVisible()
    expect(
      screen.getByRole('textbox', { name: 'Mensagem para Carla Mendes' }),
    ).toBeDisabled()
    const tickets = screen.getByRole('complementary', {
      name: 'Chamados do cliente',
    })
    expect(
      within(tickets).getByText('Solicitação de acesso ao SAP'),
    ).toBeVisible()
    expect(
      within(tickets).queryByText('Notebook lento após atualização'),
    ).not.toBeInTheDocument()
  })

  it('preserva as mensagens e o estado ao alternar conversas', async () => {
    const user = userEvent.setup()
    render(<TechnicianWorkspace />)
    await user.click(
      screen.getByRole('button', { name: 'Assumir atendimento' }),
    )
    const composer = screen.getByRole('textbox', {
      name: 'Mensagem para Ana Souza',
    })
    await user.clear(composer)
    await user.type(composer, 'Acompanhamento da Ana')
    const list = screen.getByRole('complementary', {
      name: 'Lista de conversas',
    })
    await user.click(within(list).getByRole('button', { name: /Carla Mendes/ }))
    await user.click(within(list).getByRole('button', { name: /Ana Souza/ }))
    expect(
      screen.getByRole('textbox', { name: 'Mensagem para Ana Souza' }),
    ).toHaveValue('Acompanhamento da Ana')
    expect(
      screen.getByRole('button', { name: 'Encerrar atendimento' }),
    ).toBeEnabled()
  })
})
