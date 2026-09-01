import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '../../..')
const databasePath = join(projectRoot, 'backend/users.db')

function createFiveCharacterUsername() {
  return `u${randomBytes(2).toString('hex')}`
}

function deleteTestUser(username) {
  execFileSync('python3', [
    '-c',
    [
      'import sqlite3, sys',
      'database_path = sys.argv[1]',
      'username = sys.argv[2]',
      'connection = sqlite3.connect(database_path)',
      'connection.execute("DELETE FROM users WHERE username = ?", (username,))',
      'connection.commit()',
      'connection.close()',
    ].join('\n'),
    databasePath,
    username,
  ])
}

test('REG-002 rejects registration when username has fewer than 6 characters', async ({ page, request }) => {
  const username = createFiveCharacterUsername()

  try {
    const healthResponse = await request.get('http://127.0.0.1:5000/api/health')
    expect(healthResponse.ok()).toBe(true)

    await page.goto('/register')

    await page.getByPlaceholder('请输入用户名').fill(username)
    await page.getByPlaceholder('请输入密码').fill('Password123!')

    const registerResponsePromise = page.waitForResponse((response) => (
      response.url().includes('/api/register')
      && response.request().method() === 'POST'
    ))

    await page.getByRole('button', { name: /注\s*册/ }).click()

    const registerResponse = await registerResponsePromise
    console.log(`UI_TEST_RESULT:${JSON.stringify({
      test_case_id: 'REG-002',
      test_scenario: '用户名少于 6 个字符时应拒绝注册',
      expected_status_code: 400,
      actual_status_code: registerResponse.status(),
    })}`)
    expect(registerResponse.status()).toBe(400)
    await expect(page).toHaveURL(/\/register$/)
  } finally {
    deleteTestUser(username)
  }
})
