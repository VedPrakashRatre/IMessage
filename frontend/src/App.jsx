
import './App.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
function App() {

  return (
    <div>
      <h1>Hello</h1>
      <header>
        <Show when="signed-out">
          <SignInButton mode='model' />
          <SignUpButton mode='model' />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </div>
  )
}

export default App
