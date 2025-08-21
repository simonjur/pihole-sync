# pihole data sync

I use this script to sync my home lab pi-holes to have the same data:

- allow domains
- local dns records

How to run it:

```bash
cp config.yaml.example config.yaml
npm run sync
```

with custom config:

```bash
npm run sync -- --config another-config.yaml
```

## Configuring pi-holes access

Defining pi-holes access manually in config:

```yaml
# works only for piholes ver. 6+
pi-holes:
  - url: 'http://192.168.1.3:9080'
    password: '******'
    name: 'backup-pihole'
  - url: 'http://192.168.1.4:9080'
    password: '******'
    name: 'primary-pihole'#
```

Or use local Bitwarden:

> [!NOTE]
> needs [bw cli](https://www.npmjs.com/package/@bitwarden/cli) to work)

```yaml
# if defined will overwrite anything in pi-holes section
pi-holes-from-bitwarden:
    search-string: 'pihole'
```

> [!IMPORTANT]
> Any item must have defined custom field
> named `active` of type `checkbox` and set to `true` to be used.
