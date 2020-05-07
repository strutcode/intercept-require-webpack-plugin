# Intercept Require Webpack Plugin

A quick and dirty plugin that overrides the behavior of webpack's emitted require shim. Useful if you need to alter the behavior or the resulting module dynamically, e.g. to provide a mock module instead of the real one when testig using `mochapack`.

**Not recommended for production use.**
