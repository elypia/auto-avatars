# Privacy Policy

Once configured, this add-on will connect to online servers to fetch avatars for your contacts. The server we recommend is [libravatar.org](https://www.libravatar.org).

The following data is transmitted from your machine:

* A [SHA256](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/digest#algorithm) hash of your contact's email address, this can not be reversed back to the original email address.
* Inherent with connecting to another server in a browser, this will transmit information about your client like your IP address (which may reveal your geolocation) and User-Agent.

If you configure the preferred Libravatar instance in the add-on preferences, then this information is transmitted to that server instead of the recommended instance.

If you enable federation by setting a DNS-over-HTTPS server in the add-on preferences, this will transmit more data externally:

* The domain names of your contacts will be transmitted to the configured DNS-over-HTTPS provider. For example, the domain `example.org` if the add-on attempts to fetch the avatar for `alice@example.org`.
* Inherent with connecting to another server in a browser, this will transmit information about your client like your IP address (which may reveal your geolocation) and User-Agent.
