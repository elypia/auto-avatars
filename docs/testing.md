# Testing

This documents how to load the extension locally to test or debug issues.

## Setup

First, follow the instructions in our [Contribution Guide](../CONTRIBUTING.md), which will guide you through how to setup and build the project.

Then run the `build` command to output the built extension that can be installed on Thunderbird locally:

```sh
npm run build
```

This will create a file, `./web-ext-artifacts/auto_avatars-x.y.z.zip`.

## Installing

Follow the drag-and-drop instructions in [Installing an Add-on in Thunderbird](https://support.mozilla.org/kb/installing-addon-thunderbird#w_drag-and-drop) documentation from Thunderbird. Where it refers to an XPI file, that's the `*.zip` file you build in the previous step.

Once installed, you can experiment with the extension. Note that the extension has preferences, so changes should be tested against different options as well.

You can read about each option in the [Options](./options.md) documentation.
