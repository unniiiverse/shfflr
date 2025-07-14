import * as uuid from 'uuid';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { IConfig, configScheme } from './types/types';




async function run() {
  try {
    const config = yaml.load(fs.readFileSync(`./config.yml`).toString()) as IConfig;
    configScheme.parse(config);

    const distFolder = config.dist_dir;
    const srcFolder = config.source_dir;

    if (!fs.existsSync(srcFolder)) throw new Error(`No source folder found (${srcFolder})`);

    fs.rmSync(distFolder, { force: true, recursive: true });
    fs.mkdirSync(distFolder);

    // Pull files
    const srcFiles = fs.readdirSync(srcFolder, { recursive: true });

    for (const key in srcFiles) {
      const pathname = srcFiles[key] as string;
      const extname = path.extname(pathname);
      if (!extname) continue;

      fs.copyFileSync(`${srcFolder}/${pathname}`, `${distFolder}/${uuid.v4()}${extname}`);
    }

    // Remove same & shuffle
    let distFiles = fs.readdirSync(distFolder);
    const distHash = new Set();

    for (const key in distFiles) {
      const pathname = distFiles[key];

      const hash = await checksumFile(`${distFolder}/${pathname}`);

      // Remove exist hash
      if (distHash.has(hash)) fs.rmSync(`${distFolder}/${pathname}`);

      distHash.add(hash);
    }
  } catch (e) {
    console.error(e);
  }
}

function checksumFile(path) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    const stream = fs.createReadStream(path);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}



run();