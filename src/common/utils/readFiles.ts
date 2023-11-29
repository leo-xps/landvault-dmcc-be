import * as fs from 'fs';

export async function getHTMLFileFromTemplates(fileLocation: string) {
  try {
    // const fileLoc = path.join(__dirname, '..', '..', 'template', fileLocation);
    // const data = fs.readFileSync(fileLoc, 'utf8');
    const data = fs.readFileSync(fileLocation, 'utf8');
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
