import { version } from '../index.ts'

const versionElement = document.querySelector('#version')

if (versionElement) {
  versionElement.textContent = `version: ${version}`
}
