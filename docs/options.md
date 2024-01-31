# Auto Avatar Options

For most users, the default settings should work for you. However, if you'd like to tweak them, here is an explanation of each setting.

## Preferred Instance

The preferred Libravatar instance you want to connect to. This defaults to the official instances hosted at [libravatar.org](https://www.libravatar.org).

When federation is disabled, or the contact does not host their own server, this is the server that is used to check for an avatar.

## DNS Server

Libravatar is federated, so anyone can choose where their avatar is hosted and indicate the location in their DNS records.

For example, if you have a contact with the email of `alice@example.org`, they may choose to define a custom Libravatar instance in a [SRV](https://en.wikipedia.org/wiki/SRV_record) record under `example.org`.

This option defines which DNS-over-HTTPS server we use to discover federated instances, but is disabled by default to preserve privacy. When federation is enabled:

* You send the domain name of your contacts to the respective DNS-over-HTTPS server, along with your IP, geolocation, etc.
* If your contact has configured a Libravatar instance, you will connect to their preferred server, once again sending your IP, geolocation, etc.

Federation is amazing on server-side, but because this add-on runs client-side, it leads to the privacy implications.

Note: Most DNS-over-HTTPS servers are not supported due to strict CORS policies configured by those servers. Cloudflare and Google are the only ones we've found to have a lax enough policy to work reliably.

## Default Avatar

By default, if the contact does not host their own Libravatar instance, is not on your preferred Libravatar instance, and isn't on Gravatar, then we don't set the contact's picture at all.

If you want all contacts to have an image, you can specify a generator keyword, this generates a consistent image for a given email address.

You can experiment with all the options on [libravatar.org/tools/check](https://www.libravatar.org/tools/check/) before picking an option.
