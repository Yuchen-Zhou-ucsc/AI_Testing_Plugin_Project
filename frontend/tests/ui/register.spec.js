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

function createValidUsername() {
  return `uitest_${randomBytes(4).toString('hex')}`
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

function waitForRegisterRequest(page) {
  return page.waitForRequest(
    (browserRequest) => (
      browserRequest.url().includes('/api/register')
      && browserRequest.method() === 'POST'
    ),
    { timeout: 500 },
  ).then(() => true).catch(() => false)
}

test('REG-001 registers successfully when username and password are valid', async ({ page, request }) => {
  const username = createValidUsername()

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
      test_case_id: 'REG-001',
      test_scenario: '合法用户名和密码应注册成功并跳转登录页',
      expected_status_code: 201,
      actual_status_code: registerResponse.status(),
    })}`)
    expect(registerResponse.status()).toBe(201)
    await expect(page).toHaveURL(/\/login$/)
  } finally {
    deleteTestUser(username)
  }
})

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

test('REG-003 validates that username is required before registration is submitted', async ({ page, request }) => {
  const healthResponse = await request.get('http://127.0.0.1:5000/api/health')
  expect(healthResponse.ok()).toBe(true)

  await page.goto('/register')

  await page.getByPlaceholder('请输入密码').fill('Password123!')

  const registerRequestPromise = waitForRegisterRequest(page)

  await page.getByRole('button', { name: /注\s*册/ }).click()

  await expect(page.getByText('请输入用户名')).toBeVisible()

  const registerRequestSent = await registerRequestPromise

  console.log(`UI_TEST_RESULT:${JSON.stringify({
    test_case_id: 'REG-003',
    test_scenario: '用户名为空时应在前端提示必填并阻止提交',
    expected_status_code: 'No request',
    actual_status_code: registerRequestSent ? 'Request sent' : 'No request',
  })}`)

  expect(registerRequestSent).toBe(false)
  await expect(page).toHaveURL(/\/register$/)
})

test('REG-004 validates that password is required before registration is submitted', async ({ page, request }) => {
  const username = createValidUsername()

  const healthResponse = await request.get('http://127.0.0.1:5000/api/health')
  expect(healthResponse.ok()).toBe(true)

  await page.goto('/register')

  await page.getByPlaceholder('请输入用户名').fill(username)

  const registerRequestPromise = waitForRegisterRequest(page)

  await page.getByRole('button', { name: /注\s*册/ }).click()

  await expect(page.getByText('请输入密码')).toBeVisible()

  const registerRequestSent = await registerRequestPromise

  console.log(`UI_TEST_RESULT:${JSON.stringify({
    test_case_id: 'REG-004',
    test_scenario: '密码为空时应在前端提示必填并阻止提交',
    expected_status_code: 'No request',
    actual_status_code: registerRequestSent ? 'Request sent' : 'No request',
  })}`)

  expect(registerRequestSent).toBe(false)
  await expect(page).toHaveURL(/\/register$/)
})

test('REG-005 rejects registration when username already exists', async ({ page, request }) => {
  const username = createValidUsername()

  try {
    const healthResponse = await request.get('http://127.0.0.1:5000/api/health')
    expect(healthResponse.ok()).toBe(true)

    const setupResponse = await request.post('http://127.0.0.1:5000/api/register', {
      data: {
        username,
        password: 'Password123!',
      },
    })
    expect(setupResponse.status()).toBe(201)

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
      test_case_id: 'REG-005',
      test_scenario: '用户名已存在时应拒绝重复注册',
      expected_status_code: 409,
      actual_status_code: registerResponse.status(),
    })}`)

    expect(registerResponse.status()).toBe(409)
    await expect(page.getByText('Username already exists')).toBeVisible()
    await expect(page).toHaveURL(/\/register$/)
  } finally {
    deleteTestUser(username)
  }
})
