## Island modules are pure

Island modules only default-export a component and have no import side effects, so SSR bakes static markup (0 KB JS) and boot.ts lazy-mounts and claims it.
