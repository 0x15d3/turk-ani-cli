import { Command } from 'commander';
const program = new Command();
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import prompts from 'prompts';

interface Result {
  title: string;
}

program
  .version('0.0.1')
  .description('Turk-Ani-CLI, Türkçe anime izlemek için geliştirilmiş bir CLI aracı')
  .option('-a, --anime <name>', 'Anime bul');

program.parse(process.argv);

const options = program.opts();
if (options.anime) {
  console.log(`Anime bilgisi getiriliyor: ${options.anime}`);
  search(options.anime).then((results) => {
    if (results === null) return console.log('Anime bulunamadı.');

    prompt(results as Result[]);
  });
}

async function search(query: string) {
  const fd = new URLSearchParams();
  fd.append('arama', query);

  const results: Result[] = [];

  try {
    const response = await fetch("https://www.turkanime.co/arama", {
      method: 'POST',
      body: fd,
    });
    const text = await response.text();
    const $ = cheerio.load(text);

    $('.panel-title a').each((index, element) => {
      const title = $(element).text().trim();
      results.push({ title });
    });
    return results.length > 0 ? results : null;
  } catch (error) {
    console.log('[HATA] ', error);
  }
}

async function prompt(results: Result[]) {
  const choices = results.map((result) => ({
    title: result.title,
    value: result.title,
  }));

  try {
    const response: { selectedAnime: string } = await prompts({
      type: 'select',
      name: 'selectedAnime',
      message: 'Bir anime seçin:',
      choices: choices,
    });

    console.log(`Seçilen anime: ${response.selectedAnime}`);
  } catch (error) {
    console.log('[HATA] ', error);
  }
}
