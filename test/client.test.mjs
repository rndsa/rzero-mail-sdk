import test from 'node:test';
import assert from 'node:assert/strict';
import { RZeroMail } from '../dist/index.mjs';

test('RZeroMail constructor defaults and custom domain config', () => {
  const clientDefault = new RZeroMail();
  assert.equal(typeof clientDefault.getDomains, 'function');

  const clientCustom = new RZeroMail({
    baseUrl: 'https://mail.mycustomdomain.com',
    defaultDomain: 'mycustomdomain.com',
    timeout: 5000
  });
  assert.equal(typeof clientCustom.createRandom, 'function');
});

test('RZeroMail live API integration tests', async (t) => {
  const mail = new RZeroMail();

  await t.test('getDomains() returns active verified domains list', async () => {
    const domains = await mail.getDomains();
    assert.ok(Array.isArray(domains), 'domains should be an array');
    assert.ok(domains.length > 0, 'domains should not be empty');
    assert.ok(domains.includes('rzmail.my.id'), 'should contain primary domain');
  });

  let randomAddress = '';

  await t.test('createRandom() generates a valid inbox', async () => {
    const inbox = await mail.createRandom();
    assert.ok(inbox.success, 'inbox creation should succeed');
    assert.ok(inbox.address, 'inbox should have an address string');
    assert.ok(inbox.address.includes('@'), 'address must contain @');
    randomAddress = inbox.address;
  });

  await t.test('getMessages() checks message list for the generated inbox', async () => {
    const res = await mail.getMessages(randomAddress);
    assert.ok(res.success, 'getMessages should succeed');
    assert.equal(typeof res.count, 'number');
    assert.ok(Array.isArray(res.messages));
  });

  await t.test('getOtp() retrieves OTP status cleanly', async () => {
    const res = await mail.getOtp(randomAddress);
    assert.ok(res.success, 'getOtp should succeed');
    assert.equal(res.has_otp, false);
    assert.equal(res.otp, null);
  });

  await t.test('createCustom() binds a custom username and domain', async () => {
    const testUser = `sdktest_${Date.now().toString(36)}`;
    const customInbox = await mail.createCustom(testUser, { domain: 'zallpyx.xyz' });
    assert.ok(customInbox.success, 'custom inbox creation should succeed');
    assert.equal(customInbox.address, `${testUser}@zallpyx.xyz`);
  });
});
