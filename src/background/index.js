/*
 * Copyright 2024-2024 Seth Falco and Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ICAL from './libs/ical.min.js';
import { getAvatar } from './libravatar.js';
import { hasUserOptedIn } from './utils.js';

/**
 * @typedef {Object<string, { oldValue: ?string, newValue: ?string }>} PropertyChange
 *
 * @typedef {Object} ContactProperties
 * @property {string} vCard
 *
 * @typedef {Object} ContactNode
 * @property {string} id
 * @property {ContactProperties} properties
 * @property {'contact'} type
 * @property {string} parentId
 * @property {boolean} readOnly
 * @property {boolean} remote
 */

/** Size of the avatar to fetch in pixels. */
const AVATAR_SIZE = 256;

/**
 * @param {ContactNode} contactNode A node representing a contact in an address book.
 * @returns {?string} Primary address of the contact.
 */
function getPrimaryEmail(contactNode) {
  const [ component, jCard ] = ICAL.parse(contactNode.properties.vCard);
  if (component !== 'vcard') {
    return null;
  }

  const emailEntry = jCard.find(data => data[0] === 'email');
  if (!emailEntry) {
    return null;
  }

  return emailEntry[3];
}

/**
 * @param {ContactNode} contactNode A node representing a contact in an address book.
 * @returns {Promise<void>}
 */
async function onContactCreated(contactNode) {
  await updateContact(contactNode);
}

/**
 * @param {ContactNode} contactNode A node representing a contact in an address book.
 * @param {?PropertyChange} _changedProperties A dictionary of changed properties. Keys are the property name that changed, values are an object containing oldValue and newValue. Values can be either a string or null.
 * @returns {Promise<void>}
 */
async function onContactUpdated(contactNode, _changedProperties) {
  await updateContact(contactNode);
}

async function updateContact(contactNode) {
  const canFetchAvatars = await hasUserOptedIn();
  if (!canFetchAvatars || contactNode.readOnly) {
    return;
  }

  const primaryEmail = getPrimaryEmail(contactNode);
  if (!primaryEmail) {
    return;
  }

  const currentPhoto = await messenger.contacts.getPhoto(contactNode.id);
  if (currentPhoto) {
    return;
  }

  const photo = await getAvatar(primaryEmail, AVATAR_SIZE);
  if (!photo) {
    return;
  }

  messenger.contacts.setPhoto(contactNode.id, photo);
}

async function updateAllContacts() {
  const canFetchAvatars = await hasUserOptedIn();
  if (!canFetchAvatars) {
    return;
  }

  const addressBooks = await messenger.addressBooks.list(true);

  if (!addressBooks) {
    return;
  }

  const writeableLocalContacts = addressBooks
    .filter((ab) => !ab.remote && !ab.readOnly)
    .flatMap((ab) => ab.contacts);

  let progress = 0;

  for (const contact of writeableLocalContacts) {
    await updateContact(contact);
    await messenger.runtime.sendMessage(
      null,
      JSON.stringify({
        job: 'apply-to-all-contacts',
        status: 'progress',
        data: {
          progress: ++progress,
          total: writeableLocalContacts.length
        }
      }),
      null
    );
  }
}

async function onMessage(message) {
  const parsed = JSON.parse(message);

  if (parsed.job === 'apply-to-all-contacts' && parsed.status === 'started') {
    updateAllContacts();
  }
}

function onInstalled(details) {
  if (details.reason != 'install') {
    return;
  }

  messenger.runtime.openOptionsPage();
}

messenger.runtime.onInstalled.addListener(onInstalled);
messenger.contacts.onCreated.addListener(onContactCreated);
messenger.contacts.onUpdated.addListener(onContactUpdated);
messenger.runtime.onMessage.addListener(onMessage)
