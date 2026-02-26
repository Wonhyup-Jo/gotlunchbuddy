const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['client/renderer.js'],
  bundle: true,
  outfile: 'client/dist/bundle.js',
  loader: { '.jsx': 'jsx', '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"development"' },
  sourcemap: true,
};

if (isWatch) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('esbuild watching for changes...');
  });
} else {
  esbuild.build(buildOptions).then(() => {
    console.log('Client build complete.');
  });
}
