# Legacy NeakLork PNG Icons

The app no longer renders these PNG files.

Active UI icons use PrimeIcons through:

```vue
<AppIcon name="orders_clipboard" :size="24" />
```

`AppIcon` maps the old NeakLork icon keys to PrimeIcons classes so pages do not need direct image paths.
