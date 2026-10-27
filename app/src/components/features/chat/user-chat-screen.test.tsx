import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import UserChatScreen from './user-chat-screen'

describe('UserChatScreen', () => {
  it('atualiza os afetados e permite revisar o rascunho antes de confirmar', async () => {
    const user = userEvent.setup()
    render(<UserChatScreen />)

    await user.click(screen.getByRole('radio', { name: 'Minha equipe' }))
    const draft = screen.getByRole('article')
    expect(within(draft).getByText('Sua equipe')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const title = screen.getByRole('textbox', { name: 'Título' })
    await user.clear(title)
    await user.type(title, 'VPN indisponível para a equipe')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(within(draft).getByRole('heading')).toHaveTextContent(
      'VPN indisponível para a equipe',
    )
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhum chamado foi enviado ao servidor.',
    )
    expect(
      screen.queryByRole('button', { name: 'Confirmar' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Minha equipe' })).toBeDisabled()
  })

  it('descarta alterações ao voltar da edição', async () => {
    const user = userEvent.setup()
    render(<UserChatScreen />)
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByRole('textbox', { name: 'Título' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Título' }),
      'Título descartado',
    )
    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(
      screen.getByRole('heading', {
        name: 'VPN não conecta no notebook — erro 809',
      }),
    ).toBeVisible()
    expect(screen.queryByText('Título descartado')).not.toBeInTheDocument()
  })

  it('cancela o rascunho sem apresentar um chamado como criado', async () => {
    const user = userEvent.setup()
    render(<UserChatScreen />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Rascunho cancelado. Nenhum chamado foi criado.',
    )
    expect(
      screen.queryByRole('button', { name: 'Confirmar' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Mensagem para o Nexo' }),
    ).toBeEnabled()
  })

  it('envia por Enter, rejeita mensagens vazias e respeita o limite da prévia', async () => {
    const user = userEvent.setup()
    render(<UserChatScreen />)
    const composer = screen.getByRole('textbox', {
      name: 'Mensagem para o Nexo',
    })
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    await user.type(composer, '   ')
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    await user.clear(composer)

    for (let index = 1; index <= 12; index++) {
      await user.type(composer, `Mensagem ${index}{Enter}`)
    }

    expect(
      within(screen.getByRole('log')).getByText('Mensagem 12', {
        exact: false,
      }),
    ).toBeVisible()
    expect(composer).toHaveValue('')
    expect(composer).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
    expect(screen.getByText(/30\/30 mensagens/)).toBeVisible()
  })
})
