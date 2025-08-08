# pihole data sync

I use this script to sync my home lab pi-holes to have the same data:
- allow domains
- local dns records

How to run it:
```bash
cp config.yaml.example config.yaml
npm run sync -- --config config.yaml
```
