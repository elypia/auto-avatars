# Auto Avatars

[![Build status](https://gitlab.com/Elypia/auto-avatars/badges/main/pipeline.svg)](https://gitlab.com/Elypia/auto-avatars/commits/main)

## About

Add-on for Thunderbird that automatically populates contact photos with their Libravatar or Gravatar photo.

The primary way to use this extension is to:

1. Navigate to the **Address Book**
2. Either update or create a new contact.
3. If the contact does not explicitly have an avatar, the add-on will automatically set one on save.

Auto Avatars will also fetch avatars for Collected Addresses, which are the contracts that are created when you send emails to addresses not already in one of your personal address books.

### Demo

![Demonstration of the add-on in action. I create a new contact in an empty address book with the email address seth@falco.fun, and then press Save. After saving, Thunderbird updates the contact that was just created to feature the avatar from Libravatar.](./assets/demo.webm)

## Fetching Avatars

As Libravatar is a federated, Auto Avatars can check multiple locations for an avatar. Attempts will only be made to fetch avatars from secure sources (HTTPS).

We fetch avatars in the following order:

1. The contacts preferred Libravatar instance if federation is enabled. (Disabled by default!)
2. Your preferred Libravatar server, defaults to the hosted Libravatar instance at [libravatar.org](https://www.libravatar.org).
3. Fallback to Gravatar, the request is proxied through the hosted Libravatar instance.

To learn more about and enable federation support, see the [add-on preferences](./docs/options.md) documentation.

## Why Libravatar

If you've found this extension while looking for a add-on for Gravatar, this will do what you're looking for. However, you might be wondering what [Libravatar](https://www.libravatar.org) is, and why we favor it when it's available.

Libravatar is an avatar service similar to Gravatar, except it is community backed, open-source, and federated. Libravatar has a similar user interface and API to Gravatar, while avoiding the problems that stem from centralization.

Many websites use Libravatar already, or support overriding Gravatar with it:

* [Discourse](https://github.com/discourse/discourse/pull/9137)
* [GitLab](https://docs.gitlab.com/ee/administration/libravatar.html)
* [Fedora](https://accounts.fedoraproject.org/)
* [Keyoxide](https://keyoxide.org/)
