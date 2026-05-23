import App from './App.svelte'
import './styles.css'
import { mount } from 'svelte'

const target = document.getElementById('app')
if (!target) {
  throw new Error('App root element was not found.')
}

target.replaceChildren()

const app = mount(App, {
  target,
})

export default app
