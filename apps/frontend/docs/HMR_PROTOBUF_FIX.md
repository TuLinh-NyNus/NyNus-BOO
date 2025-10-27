# Google Protobuf HMR Fix Documentation

## Issue Description

When using `google-protobuf` with Next.js Hot Module Replacement (HMR), especially with Turbopack, you may encounter the following error:

```
Error: Module [project]/node_modules/.pnpm/google-protobuf@3.21.2/node_modules/google-protobuf/google-protobuf.js 
[app-client] (ecmascript) was instantiated because it was required from module 
[project]/apps/frontend/src/generated/v1/user_pb.js [app-client] (ecmascript), 
but the module factory is not available. It might have been deleted in an HMR update.
```

## Root Cause

The `google-protobuf` package is a CommonJS module that uses `require()` syntax. When HMR updates occur in Next.js, the module factory for CommonJS modules can be lost, causing the error.

## Solution Implemented

We've implemented a simple and effective fix:

### 1. Transpile Package Configuration

Added `google-protobuf` to the `transpilePackages` list in `next.config.js`:

```javascript
transpilePackages: ['google-protobuf'],
```

This tells Next.js to transpile the CommonJS module for compatibility with modern JavaScript module systems.

### 2. Server Components External Packages

Added to experimental configuration for server-side compatibility:

```javascript
experimental: {
  serverComponentsExternalPackages: ['google-protobuf'],
}
```

This ensures the module is properly handled in server components.

## Using the Fix

### Development Mode

The fix is automatically applied when running the development server:

```bash
# With Turbopack (recommended for HMR)
pnpm dev

# With Webpack fallback
pnpm dev:webpack
```


## Troubleshooting

### If HMR Error Persists

1. **Clear Next.js cache:**
   ```bash
   pnpm clean:cache
   pnpm dev
   ```

2. **Restart development server:**
   - Stop the dev server (Ctrl+C)
   - Clear `.next` folder
   - Start again with `pnpm dev`

3. **Check Node modules:**
   ```bash
   # Remove and reinstall dependencies
   rm -rf node_modules
   pnpm install
   ```

### Alternative: Disable Fast Refresh

If issues persist, you can temporarily disable Fast Refresh in development:

```javascript
// next.config.js
module.exports = {
  // ... other config
  reactStrictMode: false, // Temporarily disable
}
```

## Future Improvements

1. **Migrate to ES Modules:** Consider using protobuf libraries that support ES modules natively
2. **Use protobuf-ts:** Alternative TypeScript-first protobuf library with better HMR support
3. **Custom Webpack Plugin:** Create a webpack plugin specifically for handling protobuf HMR

## References

- [Next.js Transpile Packages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
- [Turbopack Configuration](https://turbo.build/pack/docs/features/customizing-turbopack)
- [Google Protobuf Issue #1248](https://github.com/protocolbuffers/protobuf/issues/1248)
