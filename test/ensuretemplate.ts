// check if dist/teamplte/* exists and has files, if not, copy from src/template/*

import fs from 'fs';

const src = 'src/client';

const dist = 'dist/client';

const files = fs.readdirSync(src);

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

// recursively copy files and directories

const copy = (src: string, dist: string) => {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dist)) {
      fs.mkdirSync(dist);
    }
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      copy(`${src}/${file}`, `${dist}/${file}`);
    });
  } else {
    fs.copyFileSync(src, dist);
  }
};

files.forEach((file) => {
  copy(`${src}/${file}`, `${dist}/${file}`);
});
