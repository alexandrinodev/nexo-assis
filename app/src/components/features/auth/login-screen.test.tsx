import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LoginScreen from './login-screen'

describe('LoginScreen', () => {
  it('permite mostrar e ocultar a senha usando o teclado sem perder o valor', async () => {
    const user = userEvent.setup()
    render(<LoginScreen />)

    const password = screen.getByLabelText('Senha')
    await user.click(password)
    await user.type(password, 'senha-de-exemplo')
    await user.tab()

    const toggle = screen.getByRole('button', { name: 'Mostrar senha' })
    expect(toggle).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(password).toHaveAttribute('type', 'text')
    expect(password).toHaveValue('senha-de-exemplo')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard(' ')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveValue('senha-de-exemplo')
    expect(toggle).toHaveAccessibleName('Mostrar senha')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('informa a ausência de autenticação ao enviar o formulário', async () => {
    const user = userEvent.setup()
    render(<LoginScreen />)

    await user.type(
      screen.getByRole('textbox', { name: 'E-mail corporativo' }),
      'pessoa@nexo.com.br',
    )
    await user.type(screen.getByLabelText('Senha'), 'senha-de-exemplo')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'O acesso estará disponível assim que a autenticação for configurada.',
    )
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })

  it('orienta a recuperação de senha pelo ramal de suporte', async () => {
    const user = userEvent.setup()
    render(<LoginScreen />)

    await user.click(
      screen.getByRole('button', { name: 'Esqueci minha senha' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Para recuperar sua senha, ligue para a equipe de TI no ramal 4000.',
    )
    expect(
      screen.getByRole('link', { name: 'Ligue no ramal 4000' }),
    ).toHaveAttribute('href', 'tel:4000')
  })

  it('permite alterar a opção de manter a sessão conectada', async () => {
    const user = userEvent.setup()
    render(<LoginScreen />)
    const remember = screen.getByRole('checkbox', {
      name: 'Manter conectado neste computador',
    })
    expect(remember).toBeChecked()
    await user.click(remember)
    expect(remember).not.toBeChecked()
  })
})
