import { hasUserOptedIn } from '../background/utils.js';
import { DEFAULT_AVATAR, DEFAULT_HOST } from '../constants.js';

/**
 * If the "Apply to all Contacts" job is currently in progress. This is to
 * disable the button meanwhile.
 *
 * @type {boolean}
 */
let isApplyToAllContactsInProgress = false;

function onUseRecommendedInstanceClick() {
  document.querySelector('#preferred-instance').value = DEFAULT_HOST;
  saveOptions();
}

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

  updateButtonActions();
}

async function restoreOptions() {
  let res = await messenger.storage.sync.get('preferredInstance');
  document.querySelector('#preferred-instance').value = res.preferredInstance || '';

  res = await messenger.storage.sync.get('dohServer');
  document.querySelector('#doh-server').value = res.dohServer || '';

  res = await messenger.storage.sync.get('defaultAvatar');
  document.querySelector('#default-avatar').value = res.defaultAvatar || DEFAULT_AVATAR;

  updateButtonActions();
}

async function applyToAllContacts() {
  if (isApplyToAllContactsInProgress) {
    return;
  }

  isApplyToAllContactsInProgress = true;
  await updateButtonActions();

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

    if (progress !== total) {
      placeholder.style.display = 'initial';
      placeholder.value = progress;
      placeholder.max = total;
    } else {
      placeholder.style.display = 'none';
      isApplyToAllContactsInProgress = false;
      await updateButtonActions();
    }
  }
}

async function updateButtonActions() {
  const actionButtons = document.querySelectorAll('.action-button');
  const canFetchAvatars = await hasUserOptedIn();
  const isDisabled = isApplyToAllContactsInProgress || !canFetchAvatars;

  for (const actionButton of actionButtons) {
    actionButton.disabled = isDisabled;
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document.querySelector('#apply-to-all-contacts').addEventListener('click', applyToAllContacts);
document.querySelector('#recommended-instance').addEventListener('click', onUseRecommendedInstanceClick);
messenger.runtime.onMessage.addListener(onMessage)
