import { DEFAULT_HOST, DEFAULT_AVATAR } from '../constants.js';

/**
 * If the "Apply to all Contacts" job is currently in progress. This is to
 * ignore the button if the user pushes it while we're already updating contacts.
 *
 * @type {boolean}
 */
let isApplyToAllContactsInProgress = false;

async function saveOptions(event) {
  event.preventDefault();

  let preferredInstance = document.querySelector('#preferred-instance').value;

  if (preferredInstance.endsWith('/')) {
    const instanceUrl = new URL(preferredInstance);

    if (instanceUrl.pathname === '/') {
      preferredInstance = preferredInstance.slice(0, preferredInstance.length - 1);
    }
  }

  await messenger.storage.sync.set({
    preferredInstance,
    dohServer: document.querySelector('#doh-server').value,
    defaultAvatar: document.querySelector('#default-avatar').value
  });
}

async function restoreOptions() {
  let res = await messenger.storage.sync.get('preferredInstance');
  document.querySelector('#preferred-instance').value = res.preferredInstance || DEFAULT_HOST;

  res = await messenger.storage.sync.get('dohServer');
  document.querySelector('#doh-server').value = res.dohServer || '';

  res = await messenger.storage.sync.get('defaultAvatar');
  document.querySelector('#default-avatar').value = res.defaultAvatar || DEFAULT_AVATAR;
}

function applyToAllContacts() {
  if (isApplyToAllContactsInProgress) {
    return;
  }

  messenger.runtime.sendMessage(
    null,
    JSON.stringify({ job: 'apply-to-all-contacts', status: 'started' }),
    null
  );
}

async function onMessage(message) {
  const parsed = JSON.parse(message);

  if (parsed.job === 'apply-to-all-contacts' && parsed.status === 'progress') {
    const { progress, total } = parsed.data;
    const placeholder = document.querySelector('#progress-bar');
    isApplyToAllContactsInProgress = progress !== total;

    if (isApplyToAllContactsInProgress) {
      placeholder.style.display = 'initial';
      placeholder.value = progress;
      placeholder.max = total;
    } else {
      placeholder.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document.querySelector('#apply-to-all-contacts').addEventListener('click', applyToAllContacts);
messenger.runtime.onMessage.addListener(onMessage)
