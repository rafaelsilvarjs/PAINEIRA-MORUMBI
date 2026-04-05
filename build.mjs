import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/app.jsx'],
  bundle: true,
  outfile: 'public/app.js',
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx'
  }
});

console.log('Frontend React gerado em public/app.js');
